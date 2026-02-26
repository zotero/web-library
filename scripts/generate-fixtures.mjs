import fs from 'fs-extra';
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { chromium } from 'playwright';
import { stateProcessSymbols, stateToJSON } from '../test/utils/state.js';
import secret from '../.secret.json' with { type: "json" };
import child_process from "child_process";
import psTree from 'ps-tree';

import {fixtures as fixturesRaw} from "./fixtures.mjs";

// This script can be used to generate/update state fixtures used in tests.
// It starts the web library configured to use the test library and generates state
// fixtures for the URLs in the fixtures array.
// This file depends on a .secret.json file in the root directory with the following structure:
// {
// 	"apiKey": "",
// 	"userName": "",
// 	"userId": "",
// 	"translateServerUrl": "",
// 	"recognizerServerUrl": ""
// }

const URL = 'http://localhost:8001/';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NPMST_TIMEOUT = 120000; // allow for the worst-case scenario where submodules must be built

const fixtures = fixturesRaw.map(([path, ...rest]) => [`${URL}${path}`, ...rest]);

const config = JSON.stringify({
	translateUrl: secret.translateServerUrl,
	recognizerUrl: secret.recognizerServerUrl,
	libraries: {
		include: [{
			key: "g5119976",
			isGroupLibrary: true,
			name: "Animals"
		}],
		includeMyLibrary: true,
		includeUserGroups: false
	},
	userId: secret.userId,
	userSlug: secret.userName,
	apiKey: secret.apiKey,
	loggedInUser: {
		userID: secret.userId,
		slug: secret.userName,
		profileThumbnail: ""
	}
});

const index = await fs.readFile(join(ROOT, 'src', 'html', 'index.html'), 'utf8');
let subprocess;
let indexChanged = false;
let interrupted = false;

process.on('SIGINT', function () {
	interrupted = true;
	if (indexChanged) {
		restoreIndex();
	}
});

async function configureIndex() {
	console.log('Configuring index.html');
	const newIndex = index.replace(/<script type="application\/json" id="zotero-web-library-config">.*?<\/script>/gsm, `<script type="application/json" id="zotero-web-library-config">${config}</script>`);
	await fs.writeFile(join(ROOT, 'src', 'html', 'index.html'), newIndex);
	indexChanged = true;
}

async function restoreIndex() {
	console.log('Restoring index.html');
	await fs.writeFile(join(ROOT, 'src', 'html', 'index.html'), index);
}

class MisconfiguredServer extends Error {
	constructor(message) {
		super(message);
		this.name = 'MisconfiguredServer';
	}
}

async function checkOrStartServer() {
	try {
		const response = await fetch(URL);
		const text = await response.text();
		if (new RegExp(`apiKey: "${secret.apiKey}"`, 'g').test(text)) {
			return true;
		}
		throw new MisconfiguredServer("Server is running, but not with correct config. Either change the config or stop the server and run this script again.");
	} catch (e) {
		if (e instanceof MisconfiguredServer) {
			console.error(e.message);
			process.exit(1);
		}
		console.log('Server does not seem to be running, running "npm start"');
		subprocess = child_process.spawn("sh", ["-c", "npm start"], { cwd: ROOT });
		const start = Date.now();
		let jsFileFound = false;
		do {
			if (interrupted) {
				throw new Error("Interrupted");
			}
			process.stdout.write(`Waiting for server to start (${((Date.now() - start) / 1000).toFixed(1)}s/${NPMST_TIMEOUT / 1000}s)...`);
			await new Promise(resolve => setTimeout(resolve, 100));
			process.stdout.clearLine(1);
			process.stdout.cursorTo(0);

			if (!(await fs.pathExists(join(ROOT, 'build', 'static', 'web-library', 'zotero-web-library.js')))) {
				continue;
			}
			jsFileFound = true;

			try {
				const response = await fetch(URL);
				const text = await response.text();
				if (new RegExp(`"apiKey":\\s*"${secret.apiKey}"`, 'g').test(text)) {
					return true;
				} else {
					throw new Error("Server started, but not with correct config");
				}
			} catch (e) {
				if (e.code === 'ECONNREFUSED') {
					continue;
				}
			}
		} while (Date.now() - start < NPMST_TIMEOUT);
		if (jsFileFound) {
			throw new Error("Server did not start in time");
		} else {
			throw new Error("npmst failed to build zotero-web-library.js");
		}
	}
}

async function makeFixture(stateURL, name, callback) {
	console.log(`Generating state fixture for "${name}"`);
	const browser = await chromium.launch();
	const contextConfig = name.startsWith('mobile') ?
		{ viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true } :
		{ viewport: { width: 1920, height: 1080 } };
	const context = await browser.newContext(contextConfig);

	const page = await context.newPage();
	let requestsCount = 0;
	let lastRequestStarted = Date.now();

	await page.route(/^https?:\/\/files.zotero.net\/.*?$/, route => route.fulfill({
		status: 200,
		body: '',
	}));

	page.on('request', () => {
		lastRequestStarted = Date.now();
		requestsCount++;
	});

	page.on('requestfinished', () => {
		requestsCount--;
	});

	page.on('requestfailed', async request => {
		requestsCount--;
		await browser.close();
		throw new Error('Request failed: ' + request.url() + ' ' + request.failure().errorText);
	});

	await page.goto(stateURL);

	while (requestsCount > 0 || Date.now() - lastRequestStarted < 5000) {
		if (requestsCount > 0) {
			process.stdout.write(`Waiting for ${requestsCount} requests to finish...`);
		} else {
			process.stdout.write(`Waiting to see if more requests start...(last request ${((Date.now() - lastRequestStarted) / 1000).toFixed(1)}s ago)`);
		}
		if (interrupted) {
			throw new Error("Interrupted");

		}
		await new Promise(resolve => setTimeout(resolve, 100));
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
	}

	if(callback) {
		await callback(page);
	}

	const stateProcessSymbolsString = stateProcessSymbols.toString();
	const stateToJSONString = stateToJSON.toString();

	let state = await page.evaluate(([stateToJSONString, stateProcessSymbolsString]) => {
		eval(stateProcessSymbolsString);
		eval(stateToJSONString);
		return stateToJSON(window.WebLibStore.getState());
	}, [stateToJSONString, stateProcessSymbolsString]);
	state = state.replaceAll(secret.apiKey, 'zzzzzzzzzzzzzzzzzzzzzzzz');
	state = state.replaceAll(secret.userName, 'testuser');
	state = state.replaceAll(secret.userId, '1');
	state = state.replaceAll(secret.translateServerUrl, 'https://localhost/translate');
	state = state.replaceAll(secret.recognizerServerUrl, 'https://localhost/recognize');
	let stateJSON = JSON.parse(state);
	try {
		stateJSON.config.libraries.find(l => l.key === 'g5119976').isReadOnly = false;
	} catch (e) {
		console.warn('Unable to find group library "g5119976", are you running correct config?');
	}
	state = JSON.stringify(stateJSON);
	await fs.writeFile(join(ROOT, 'test', 'fixtures', 'state', `${name}.json`), state);

	await context.close();
	await browser.close();
}


const requestedFixture = process.argv[2] || null;

if (requestedFixture && !fixtures.some(([, name]) => name === requestedFixture)) {
	const available = fixtures.map(([, name]) => `  ${name}`).join('\n');
	console.error(`Unknown fixture: "${requestedFixture}"\n\nAvailable fixtures:\n${available}`);
	process.exit(1);
}

(async () => {
	await configureIndex();
	var currentFixtureName;
	try {
		await checkOrStartServer();
		const selected = requestedFixture
			? fixtures.filter(([, name]) => name === requestedFixture)
			: fixtures;
		for (const [url, name, ...rest] of selected) {
			currentFixtureName = name;
			await makeFixture(url, name, rest.length > 0 ? rest[0] : undefined);
		}
	} catch (e) {
		if (currentFixtureName) {
			console.error(`Error generating fixture for "${currentFixtureName}"`);
		}
		console.error(e);
	} finally {
		await restoreIndex();
		console.log('cleaning up');
		if (subprocess) {
			psTree(subprocess.pid, (err, children) => {
				children.forEach(function (p) {
					try {
						process.kill(p.PID, 'SIGINT');
					} catch (e) {
						// ignore
					}
				});
			});
			subprocess.kill('SIGINT');
		}
	}
})();

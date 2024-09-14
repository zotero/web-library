import fs from 'fs-extra';
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { chromium } from 'playwright';
import { stateProcessSymbols, stateToJSON } from '../test/utils/state.js';
import secret from '../.secret.json' with { type: "json" };
import child_process from "child_process";

// this file depends on a .secret.json file in the root directory with the following structure:
// {
// 	"apiKey": "",
// 	"userName": "",
// 	"userId": "",
// 	"translateServerURL": ""
// }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NPMST_TIMEOUT = 30000;

const config = JSON.stringify({
	translateUrl: secret.translateServerURL,
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

const URL = 'http://localhost:8001/';

const index = await fs.readFile(join(ROOT, 'src', 'html', 'index.html'), 'utf8');
const controller = new AbortController();
let indexChanged = false;

process.on('SIGINT', function () {
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

async function checkOrStartServer() {
	try {
		const response = await fetch(URL);
		const text = await response.text();
		if(new RegExp(`apiKey: "${secret.apiKey}"`, 'g').test(text)) {
			return true;
		}
		throw new Error("Server is running, but not with correct config");
	} catch(e) {
		console.log('Server does not seem to be running, running "npm start"');
		const { signal } = controller;
		child_process.spawn("sh", ["-c", "npm start"], { cwd: ROOT, signal });
		const start = Date.now();
		do {
			process.stdout.write(`Waiting for server to start (${((Date.now() - start) / 1000).toFixed(1)}s/${NPMST_TIMEOUT / 1000}s)...`);
			await new Promise(resolve => setTimeout(resolve, 100));
			process.stdout.clearLine(1);
			process.stdout.cursorTo(0);
			try {
				const response = await fetch(URL);
				const text = await response.text();
				if (new RegExp(`"apiKey":\\s*"${secret.apiKey}"`, 'g').test(text)) {
					return true;
				} else {
					throw new Error("Server started, but not with correct config");
				}
			} catch(e) {
				if (e.code === 'ECONNREFUSED') {
					continue;
				}
			}
		} while(Date.now() - start < NPMST_TIMEOUT);
		throw new Error("Server did not start in time");
	}
}

const fixtures = [
	[`${URL}groups/5119976/animals/items/X9WEHDAN/item-list`, 'desktop-test-group-item-view'],
	[`${URL}testuser/items/3JCLFUG4/attachment/37V7V4NT/library`, 'desktop-test-user-attachment-view'],
	[`${URL}testuser/collections/5PB9WKTC/items/MNRM7HER/collection`, 'desktop-test-user-formatting-collection'],
	[`${URL}testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`, 'desktop-test-user-item-view'],
	[`${URL}testuser`, 'desktop-test-user-library-view'],
	[`${URL}testuser/collections/CSB4KZUU/items/BLVYJQMH/note/GNVWD3U4/item-details`, 'desktop-test-user-note-view'],
	[`${URL}testuser/items/KBFTPTI4/reader`, 'desktop-test-user-reader-parent-item-view'],
	[`${URL}testuser/items/KBFTPTI4/attachment/N2PJUHD6/reader`, 'desktop-test-user-reader-view'],
	[`${URL}testuser/search/retriever/titleCreatorYear/items/KBFTPTI4/item-list`, 'desktop-test-user-search-phrase-selected'],
	[`${URL}testuser/tags/to%20read/search/pathfinding/titleCreatorYear/items/J489T6X3,3JCLFUG4/item-list`, 'desktop-test-user-search-selected'],
	[`${URL}testuser/collections/CSB4KZUU/items/3JCLFUG4/item-details`, 'mobile-test-user-item-details-view'],
	[`${URL}testuser/collections/WTTJ2J56/item-list`, 'mobile-test-user-item-list-view']
];

async function makeFixture(stateURL, name) {
	console.log(`Generating state fixture for "${name}"`);
	const browser = await chromium.launch();
	const contextConfig = name.startsWith('mobile') ?
		{ viewport: { width: 375, height: 667 }, isMobile: true } :
		{ viewport: { width: 1920, height: 1080 } };
	const context = await browser.newContext(contextConfig);

	const page = await context.newPage();
	let requestsCount = 0;
	let lastRequestStarted = Date.now();

	page.on('request', request => {
		if (request.url().match(/^https?:\/\/files.zotero.net\/.*?$/)) {
			// Ignore file requests
			return;
		}
		lastRequestStarted = Date.now();
		requestsCount++;
	});

	page.on('requestfinished', () => {
		requestsCount--;
	});

	page.on('requestfailed', async request => {
		requestsCount--;
		if (request.url().match(/^https?:\/\/files.zotero.net\/.*?$/)) {
			// Ignore failed file requests
			return;
		}
		await browser.close();
		throw new Error('Request failed: ' + request.url() + ' ' + request.failure().errorText);
	});

	await page.goto(stateURL);

	while (requestsCount > 0 || Date.now() - lastRequestStarted < 5000) {
		if(requestsCount > 0) {
			process.stdout.write(`Waiting for ${requestsCount} requests to finish...`);
		} else {
			process.stdout.write(`Waiting to see if more requests start...(last request ${((Date.now() - lastRequestStarted) / 1000).toFixed(1)}s ago)`);
		}
		await new Promise(resolve => setTimeout(resolve, 100));
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
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
	state = state.replaceAll(secret.translateServerURL, 'https://translate-server.zotero.org/Prod');
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


(async () => {
	await configureIndex();
	try {
		await checkOrStartServer();
		for (const [url, name] of fixtures) {
			await makeFixture(url, name);
		}
	} catch(e) {
		console.error(e);
	} finally {
		await restoreIndex();
		controller.abort();
	}
})();

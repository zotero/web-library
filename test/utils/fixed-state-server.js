import http from 'http';
import fs from 'fs/promises';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import serveStatic from 'serve-static';
import {getPatchedState} from './state.js';
import {waitForLoad} from "./common.js";
import {fixturePathLookup} from '../../scripts/fixtures.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

let serverSockets = new Map();
let nextSocketId = 0;

export function getPort(increment = 0) {
	return (process.env.PORT ?? 8100) + increment;
}

export async function getServer(stateRawOrName, port, customHandlers = []) {
	if (typeof customHandlers === 'function') {
		customHandlers = [customHandlers];
	}
	const stateRaw = typeof stateRawOrName === 'string' ?
		await fs.readFile(join(ROOT, 'test', 'fixtures', 'state', `${stateRawOrName}.json`), 'utf-8') :
		stateRawOrName;

	let statePatched = getPatchedState(JSON.parse(stateRaw), 'config.apiConfig', {
		apiAuthorityPart: `localhost:${port}`, apiPath: 'api/', apiScheme: 'http'
	});
	statePatched = getPatchedState(statePatched, 'config', {
		translateUrl: `http://localhost:${port}/_translate`,
		recognizerUrl: `http://localhost:${port}/_recognize`,
		stylesSourceUrl: `http://localhost:${port}/_styles`
	});

	const serve = serveStatic(join(ROOT, 'build'), {'index': false});
	const handler = (req, resp) => {
		const fallback = () => {
			resp.setHeader('Content-Type', 'text/html');
			resp.end(`<!doctype html><html lang=en>
			<head>
			<meta charset="utf-8">
				<link rel="stylesheet" href="/static/web-library/zotero-web-library.css">
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body>
			<div id="zotero-web-library" class="zotero-wl"></div>
			<script src='/static/web-library/zotero-web-library-testing.js'></script>
			<script>
				const root = createRoot(document.getElementById('zotero-web-library'));
				const state = ${JSON.stringify(statePatched)};
				root.render(createElement(MainWithState, { state }, null))
			</script></body></html>`);
		};
		for (let customHandler of customHandlers) {
			if (customHandler(req, resp)) {
				return;
			}
		}
		if (req.url.startsWith('/api')) {
			console.warn(`Potentially unhandled API request: ${req.url}`);
		}
		serve(req, resp, fallback);
	}
	const server = http.createServer(handler);
	let sockets = {};
	serverSockets.set(server, sockets);

	server.on('connection', function (socket) {
		// Add a newly connected socket
		const socketId = nextSocketId++;
		sockets[socketId] = socket;

		// Remove the socket when it closes
		socket.on('close', function () {
			delete sockets[socketId];
		});
	});

	await new Promise(resolve => server.listen(port, resolve));
	return server;
}

export async function loadFixtureState(stateName, serverPort, page, ...rest) {
	if (typeof stateName !== 'string') {
		throw new Error('loadFixtureState expects a string state name');
	}
	const path = fixturePathLookup.get(stateName);
	if (!path) {
		throw new Error(`No fixture found for state ${stateName}`);
	}
	const server = await getServer(stateName, serverPort, ...rest);
	await page.goto(`http://localhost:${serverPort}/${path}`);
	await waitForLoad(page);
	await page.waitForLoadState('networkidle');
	return server;
}

export async function closeServer(server) {
	if (!server || !server.listening) {
		return;
	}

	return Promise.race([
		new Promise((resolve) => {
			server.close(resolve);
			const sockets = serverSockets.get(server);
			for (var socketId in sockets) {
				sockets[socketId].destroy();
			}
			serverSockets.delete(server);
		}),
		new Promise((_, reject) => setTimeout(() => reject(new Error('server.close timeout')), 2000))
	]);
}

function setCommonHeaders(resp) {
	resp.statusCode = 200;
	resp.setHeader('Access-Control-Allow-Origin', '*');
	resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	resp.setHeader('Access-Control-Allow-Headers', '*');
	resp.setHeader('Access-Control-Expose-Headers', '*');
}

export function makeCustomHandler(url, jsonResponse, {totalResults = null, version = 10 ^ 6} = {}) {
	return (req, resp) => {
		if (req.url.startsWith(url)) {
			setCommonHeaders(resp);
			if (req.method === 'OPTIONS') {
				resp.end();
				return true;
			}
			resp.setHeader('Content-Type', 'application/json');
			resp.setHeader('Total-Results', `${totalResults ?? jsonResponse.length ?? 0}`);
			resp.setHeader('Last-Modified-Version', version);
			resp.end(JSON.stringify(jsonResponse));
			return true;
		}
		return false;
	};
}

export function makeTextHandler(url, textResponse) {
	return (req, resp) => {
		if (req.url.startsWith(url)) {
			setCommonHeaders(resp);
			if (req.method === 'OPTIONS') {
				resp.end();
				return true;
			}
			resp.setHeader('Content-Type', 'text/plain');
			resp.end(textResponse);
			return true;
		}
	}
}

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
		stylesSourceUrl: `http://localhost:${port}/_styles`,
		stylesBaseUrl: `http://localhost:${port}/_csl/`,
		streamingApiUrl: '',
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
		if (req.url.startsWith('/_csl/')) {
			const styleName = req.url.slice('/_csl/'.length).split('?')[0];
			const fixturePath = join(ROOT, 'test', 'fixtures', `${styleName}.csl.js`);
			import(fixturePath).then(module => {
				resp.statusCode = 200;
				resp.setHeader('Content-Type', 'application/vnd.citationstyles.style+xml');
				resp.end(module.default);
			}).catch(() => {
				console.error(`No CSL fixture for style "${styleName}", returning 404`);
				resp.statusCode = 404;
				resp.end('Not Found');
			});
			return;
		}
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

// Gate for use with makeGatedHandler. Requests arrive at the server
// immediately, but responses are held until gate.release() is called. Use to
// make tests deterministic instead of relying on wall-clock latency.
export function makeGate() {
	let release;
	const ready = new Promise(resolve => { release = resolve; });
	return { ready, release: () => release() };
}

// Like makeCustomHandler, but defers the response body until gate.ready
// resolves. The HTTP request still reaches the server (observable via
// page.waitForRequest); only the response is held.
export function makeGatedHandler(url, jsonResponse, gate, {totalResults = null, version = 10 ^ 6} = {}) {
	return (req, resp) => {
		if (!req.url.startsWith(url)) {
			return false;
		}
		setCommonHeaders(resp);
		if (req.method === 'OPTIONS') {
			resp.end();
			return true;
		}
		gate.ready.then(() => {
			resp.setHeader('Content-Type', 'application/json');
			resp.setHeader('Total-Results', `${totalResults ?? jsonResponse.length ?? 0}`);
			resp.setHeader('Last-Modified-Version', version);
			resp.end(JSON.stringify(jsonResponse));
		});
		return true;
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

// Generate mock Zotero API items for testing. Useful for creating large item
// sets that produce sparse arrays when served via makePaginatedHandler.
export function generateTestItems(count, { keyPrefix = 'TEST', titlePrefix = 'Test Item', collections = [], startIndex = 0 } = {}) {
	const padLength = Math.max(1, 8 - keyPrefix.length);
	return Array.from({ length: count }, (_, i) => {
		const index = startIndex + i;
		const key = `${keyPrefix}${String(index).padStart(padLength, '0')}`;
		return {
			key,
			version: 1000,
			library: {
				type: "user", id: 1, name: "testuser",
				links: { alternate: { href: "https://www.zotero.org/testuser", type: "text/html" } }
			},
			links: {
				self: { href: `https://api.zotero.org/users/1/items/${key}`, type: "application/json" },
				alternate: { href: `https://www.zotero.org/testuser/items/${key}`, type: "text/html" }
			},
			meta: { creatorSummary: `Author ${index}`, parsedDate: "2024", numChildren: 0 },
			data: {
				key, version: 1000, itemType: "book",
				title: `${titlePrefix} ${String(index).padStart(3, '0')}`,
				creators: [{ creatorType: "author", firstName: "Test", lastName: `Author${index}` }],
				abstractNote: "", date: "2024",
				tags: [], collections, relations: {},
				dateAdded: "2024-01-01T00:00:00Z",
				dateModified: "2024-01-01T00:00:00Z"
			}
		};
	});
}

// Generate mock Zotero tag API response objects for testing. Useful for creating
// large tag sets that exercise pagination and virtualized scrolling in TagList.
export function generateTestTags(count, { prefix = 'Tag' } = {}) {
	return Array.from({ length: count }, (_, i) => {
		const name = `${prefix} ${String(i).padStart(3, '0')}`;
		return {
			tag: name,
			links: {
				self: { href: `https://api.zotero.org/users/1/tags/${encodeURIComponent(name)}`, type: 'application/json' },
				alternate: { href: `https://www.zotero.org/testuser/tags/${encodeURIComponent(name)}`, type: 'text/html' },
			},
			meta: { type: 0, numItems: 1 },
		};
	});
}

// Create a handler that respects start/limit query parameters, producing a
// sparse array on the client when the initial fetch does not cover all items.
export function makePaginatedHandler(urlPath, allItems) {
	return (req, resp) => {
		const parsedUrl = new URL(req.url, 'http://localhost');
		if (parsedUrl.pathname !== urlPath) {
			return false;
		}
		setCommonHeaders(resp);
		if (req.method === 'OPTIONS') {
			resp.end();
			return true;
		}
		const start = parseInt(parsedUrl.searchParams.get('start') || '0');
		const limit = parseInt(parsedUrl.searchParams.get('limit') || '50');
		const slice = allItems.slice(start, start + limit);
		resp.setHeader('Content-Type', 'application/json');
		resp.setHeader('Total-Results', String(allItems.length));
		resp.setHeader('Last-Modified-Version', '1000000');
		resp.end(JSON.stringify(slice));
		return true;
	};
}

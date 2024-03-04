import http from 'http';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import serveStatic from 'serve-static';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export function getPort(increment = 0) {
	return (process.env.PORT ?? 8100) + increment;
}

export async function getServer(stateName, port) {
	const zoteroUserStateRaw = await fs.readFile(join(ROOT, 'test', 'fixtures', 'state', `${stateName}.json`), 'utf-8'); // Use fs.readFile with await
	const serve = serveStatic(join(ROOT, 'build'), { 'index': false });
	const handler = (req, resp) => {
		const fallback = () => {
			resp.setHeader('Content-Type', 'text/html');
			resp.end(`<!doctype html><html lang=en>
			<head>
			<meta charset="utf-8">
				<link rel="stylesheet" href="/static/zotero-web-library.css">
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<body>
			<div id="zotero-web-library" class="zotero-wl"></div>
			<script src='/static/zotero-web-library-testing.js'></script>
			<script>
				var root = createRoot(document.getElementById('zotero-web-library'));
				var state = ${JSON.stringify(zoteroUserStateRaw)};
				root.render(createElement(MainWithState, { state }, null))
			</script></body></html>`);
		};
		serve(req, resp, fallback);
	}
	const server = http.createServer(handler);
	await new Promise(resolve => server.listen(port, resolve));
	return server;
}

/*eslint no-console: 0*/
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const httpProxy = require('http-proxy');
const serveStatic = require('serve-static');
const argv = require('minimist')(process.argv.slice(2));
const translateURL = argv['t'] && argv['t'].length ? argv['t'] : 'http://localhost:1969';
const port = parseInt(argv['p'], 10) || 8001;

const serve = serveStatic(path.join(__dirname, '..', 'build'), { 'index': false });
const proxy = httpProxy.createProxyServer();

const handler = (req, resp) => {
	const fallback = () => {
		fs.readFile(path.join(__dirname, '..', 'build', 'index.html'), (err, buf) => {
			resp.setHeader('Content-Type', 'text/html');
			resp.end(buf);
		});
	};
	if(req.url.startsWith('/static/fonts')) {
		proxy.web(req, resp, {
			changeOrigin: true,
			target: 'https://zotero.org/',
			followRedirects: true,
		});
		proxy.on('error', () => {
			resp.statusCode = 502;
			resp.statusMessage = 'Failed to proxy font files';
			resp.end();
		});
	} else if(req.url.startsWith('/web') || req.url.startsWith('/search') || req.url.startsWith('/export')) {
		proxy.web(req, resp, {
			changeOrigin: true,
			target: `${translateURL}`,
			secure: false
		});
		proxy.on('error', () => {
			resp.statusCode = 502;
			resp.statusMessage = 'Translation Server not available';
			resp.end();
		});
	} else {
		serve(req, resp, fallback);
	}
};

http.createServer(handler).listen(port, () => {
	console.log(`>>> Listening on http://localhost:${port}/\n`);
});

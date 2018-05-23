'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const serveStatic = require('serve-static');
const argv = require('minimist')(process.argv.slice(2));
const port = argv['p'] || 8001;

const serve = serveStatic(path.join(__dirname, '..', 'build'), { 'index': false });

const handler = (req, resp) => {
	const fallback = () => {
		fs.readFile(path.join(__dirname, '..', 'build', 'index.html'), (err, buf) => {
			resp.setHeader('Content-Type', 'text/html');
			resp.end(buf);
		});
	};
	serve(req, resp, fallback);
};

http.createServer(handler).listen(port);

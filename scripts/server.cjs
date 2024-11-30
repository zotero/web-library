const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const serveStatic = require('serve-static');
const checkTrue = env => !!(env && (parseInt(env) || env === true || env === "true"));

const translateURL = process.env.TRANSLATE_URL ?? 'http://localhost:1969';
const useHTTPS = checkTrue(process.env.USE_HTTPS);
const htmlFile = checkTrue(process.env.EMBEDDED) ? 'embedded.html' : 'index.html';
const port = process.env.PORT ?? (useHTTPS ? 8443 : 8001);

const serve = serveStatic(path.join(__dirname, '..', 'build'), { 'index': false });
const proxy = httpProxy.createProxyServer();

const handler = (req, resp) => {
	const fallback = () => {
		fs.readFile(path.join(__dirname, '..', 'build', htmlFile), (err, buf) => {
			resp.setHeader('Content-Type', 'text/html');
			resp.end(buf);
		});
	};
	if (req.url.startsWith('/web') || req.url.startsWith('/search') || req.url.startsWith('/export') || req.url.startsWith('/import')) {
		proxy.web(req, resp, {
			changeOrigin: true,
			target: `${translateURL}`,
			secure: false
		});
		proxy.on('error', err => {
			resp.statusCode = 502;
			resp.statusMessage = `Translation Server not available at ${translateURL}: ${err}`;
			resp.end();
		});
	} else {
		serve(req, resp, fallback);
	}
};

if(useHTTPS) {
	const options = {
		key: fs.readFileSync(path.join(__dirname, '..', 'cert', 'web-library.key')),
		cert: fs.readFileSync(path.join(__dirname, '..', 'cert', 'web-library.crt'))
	};

	https.createServer(options, handler).listen(port, () => {
		console.log(`>>> Listening on https://0.0.0.0:${port}/\n`);
	});
} else {
	http.createServer(handler).listen(port, () => {
		console.log(`>>> Listening on http://0.0.0.0:${port}/\n`);
	});
}
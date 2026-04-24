import { test as baseTest } from '@playwright/test';
import { createServer } from 'node:net';

async function findFreePort() {
	return new Promise((resolve, reject) => {
		const server = createServer();
		server.listen(0, () => {
			const port = server.address().port;
			server.close(() => resolve(port));
		});
		server.on('error', reject);
	});
}

export const test = baseTest.extend({
	serverPort: [async ({ }, use) => {
		const port = await findFreePort();
		await use(port);
	}, { scope: 'worker' }],
	// Block any request that leaves localhost to prevent real network leaks.
	// This is applied automatically to every test via the page fixture so that
	// tests using getServer() directly are also protected.
	page: async ({ page }, use) => {
		await page.route(url => {
			const parsed = new URL(url);
			return parsed.protocol !== 'blob:' && parsed.hostname !== 'localhost';
		}, route => {
			const url = route.request().url();
			// Font tracking pixel -- nothing we can do about it, silence the warning
			if (!url.includes('hello.myfonts.net')) {
				console.error(`Blocked external request: ${url}`);
			}
			route.abort('blockedbyclient');
		});

		await page.routeWebSocket(url => {
			const parsed = new URL(url);
			return parsed.hostname !== 'localhost';
		}, ws => {
			console.error(`Blocked external WebSocket: ${ws.url()}`);
			ws.close();
		});
		await use(page);
	},
});

export const expect = test.expect;

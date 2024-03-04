import { getPort, getServer } from '../utils/fixed-state-server.js';
import { BrowserStackManager, mobileContexts } from '../utils/browserstack.js';
import { screenshot } from '../utils/screenshot.js';
import { expect } from '@playwright/test';
import { waitForLoad } from '../utils/common.js';

jest.setTimeout(60000);

describe('Mobile Snapshots', () => {
	let browsers, server, port, context;

	beforeAll(() => {
		port = getPort(parseInt(process.env.JEST_WORKER_ID) ?? 1);
		browsers = new BrowserStackManager();
	});

	afterAll(async () => {
		browsers.closeConnections();
	});

	afterEach(async () => {
		if (server) {
			await new Promise(r => server.close(r));
			server = null;
		}
		if (context) {
			await context.close();
			context = null;
		}
	});

	mobileContexts.forEach((browserName) => {
		test(`should render a list of items on "${browserName}"`, async () => {
			server = await getServer('mobile-test-user-item-list-view', port);
			context = await browsers.getBrowserContext(browserName);
			const page = await context.newPage();
			await page.goto(`http://localhost:${port}/testuser/collections/WTTJ2J56/item-list`);
			await waitForLoad(page);
			const itemsList = page.getByRole('list', { name: 'items' });
			expect(await itemsList.getByRole('listitem').count()).toBe(7);
			expect(await screenshot(page, `mobile-items-list-${browserName}`)).toBeTruthy();
			await page.close();
		});

		test(`should render item details on "${browserName}"`, async () => {
			server = await getServer('mobile-test-user-item-details-view', port);
			context = await browsers.getBrowserContext(browserName);
			const page = await context.newPage();
			await page.goto(`http://localhost:${port}/testuser/collections/CSB4KZUU/items/3JCLFUG4/item-details`);
			await waitForLoad(page);
			await expect(await page.getByRole('heading', { name: 'Cooperative pathfinding' })).toBeVisible();
			expect(await screenshot(page, `mobile-item-details-${browserName}`)).toBeTruthy();
			await page.close();
		});
	});
});

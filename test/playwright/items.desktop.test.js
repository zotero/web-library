import { getPort, getServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { BrowserStackManager, desktopContexts } from '../utils/browserstack.js';
import { screenshot } from '../utils/screenshot.js';
import { wait, waitForLoad } from '../utils/common.js';
import itemsInCollectionDogs from '../fixtures/response/test-user-get-items-in-collection-dogs.json';

jest.setTimeout(60000);

describe('Desktop Snapshots', () => {
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

	desktopContexts.forEach((browserName) => {
		test(`should render a list of items on "${browserName}"`, async () => {
			server = await getServer('desktop-test-user-item-view', port);
			context = await browsers.getBrowserContext(browserName);
			const page = await context.newPage();
			await page.goto(`http://localhost:${port}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
			await waitForLoad(page);
			await page.waitForLoadState('networkidle');
			const itemsList = await page.getByRole('grid', { name: 'items' });
			expect(await itemsList.getByRole('row').count()).toBe(8); // 7 items + header row
			await wait(500); // avoid flaky screenshot with missing icons
			expect(await screenshot(page, `desktop-items-list-${browserName}`)).toBeTruthy();
			await page.close();
		});

		test(`should render "Add Related" modal on "${browserName}"`, async () => {
			expect(itemsInCollectionDogs.length).toBe(7);
			const customHandler = makeCustomHandler('/api/users/1/collections/WTTJ2J56/items/top', itemsInCollectionDogs);
			server = await getServer('desktop-test-user-item-view', port, customHandler);
			context = await browsers.getBrowserContext(browserName);
			const page = await context.newPage();
			await page.goto(`http://localhost:${port}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
			await waitForLoad(page);

			const relatedTab = await page.getByRole('tab', { name: 'Related' });
			await relatedTab.click();

			const addRelatedButton = await page.getByRole('button', { name: 'Add Related Item' });
			await addRelatedButton.click();

			await page.waitForFunction(() => document.querySelector('.add-related-modal').classList.contains('ReactModal__Content--after-open'));
			await page.waitForFunction(() => document.querySelector('.add-related-modal').querySelectorAll('.item').length === 7);
			const dialog = await page.getByRole('dialog', { name: 'Add Related Items' });
			expect(await dialog.getByRole('row').count()).toBe(8) // +1 for header row
			await wait(500); // avoid flaky screenshot with missing icons
			expect(await screenshot(page, `desktop-item-add-related-${browserName}`)).toBeTruthy();
			await page.close();
		});
	});
});

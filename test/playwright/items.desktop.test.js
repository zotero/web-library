import { getServer, closeServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait, waitForLoad } from '../utils/common.js';
import itemsInCollectionDogs from '../fixtures/response/test-user-get-items-in-collection-dogs.json' assert { type: 'json' };

test.describe('Desktop Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test(`should render a list of items on"`, async ({ page, serverPort }) => {
		server = await getServer('desktop-test-user-item-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
		await waitForLoad(page);
		await page.waitForLoadState('networkidle');
		const itemsList = await page.getByRole('grid', { name: 'items' });
		expect(await itemsList.getByRole('row').count()).toBe(8); // 7 items + header row
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`desktop-items-list.png`);
		await page.close();
	});

	test(`should render "Add Related" modal on`, async ({ page, serverPort }) => {
		expect(itemsInCollectionDogs.length).toBe(7);
		const customHandler = makeCustomHandler('/api/users/1/collections/WTTJ2J56/items/top', itemsInCollectionDogs);
		server = await getServer('desktop-test-user-item-view', serverPort, customHandler);

		await page.goto(`http://localhost:${serverPort}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
		await waitForLoad(page);

		const relatedTab = await page.getByRole('tab', { name: 'Related' });
		await relatedTab.click();

		const addRelatedButton = await page.getByRole('button', { name: 'Add Related Item' });
		await addRelatedButton.click();

		const modal = page.getByRole('dialog', { name: 'Add Related Items' });
		await expect(modal).toBeVisible();

		await page.waitForFunction(() => document.querySelector('.add-related-modal').classList.contains('ReactModal__Content--after-open'));
		await page.waitForFunction(() => document.querySelector('.add-related-modal').querySelectorAll('.item').length === 7);
		const dialog = await page.getByRole('dialog', { name: 'Add Related Items' });
		expect(await dialog.getByRole('row').count()).toBe(8) // +1 for header row
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`desktop-item-add-related.png`);
		await page.close();
	});
});

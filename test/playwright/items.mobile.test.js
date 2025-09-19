import { getServer, closeServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { waitForLoad, wait, isSingleColumn } from '../utils/common.js';
import itemsInCollectionAlgorithms from '../fixtures/response/test-user-get-items-in-collection-algorithms.json' assert { type: 'json' };

test.describe('Mobile Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test(`should render a list of items`, async ({ page, serverPort }) => {
		server = await getServer('mobile-test-user-item-list-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/WTTJ2J56/item-list`);
		await waitForLoad(page);
		const itemsList = page.getByRole('list', { name: 'items' });
		await expect(itemsList.getByRole('listitem')).toHaveCount(7);
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`mobile-items-list.png`);

		if (isSingleColumn(test.info())) {
			// on small screens, enable search mode and take a screenshot
			const toggleSearch = await page.getByRole('button', { name: 'Toggle search' });
			await toggleSearch.click();
			expect(await page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeVisible();
			// avoid flaky screenshot with half-faded search bar
			await page.waitForFunction(() => document.querySelector('.searchbar').classList.contains('fade-enter-done'));
			await expect(page).toHaveScreenshot(`mobile-items-list-search-enabled.png`);
		}

		await page.close();
	});

	test('should render item details', async ({ page, serverPort }) => {
		server = await getServer('mobile-test-user-item-details-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/CSB4KZUU/items/3JCLFUG4/item-details`);
		await waitForLoad(page);
		await expect(await page.getByRole('heading', { name: 'Cooperative pathfinding' })).toBeVisible();
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`mobile-item-details.png`);
		await page.close();
	});

	test('should render collection in trash on', async ({ page, serverPort }) => {
		server = await getServer('mobile-test-user-trash-collection-details-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/trash/items/Z7B4P73I/item-details`);
		await waitForLoad(page);

		if (isSingleColumn(test.info())) {
			await page.getByRole('button', { name: 'Collection Trash Options' }).click();
		}

		const role = isSingleColumn(test.info()) ? 'menuitem' : 'button';
		await expect(page.getByRole(role, { name: 'Restore to Library' })).toBeVisible();
		await expect(page.getByRole(role, { name: 'Delete Permanently' })).toBeVisible();
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`mobile-trash-collection-details.png`);
		await page.close();
	});

	test('should render "Add Related" modal on', async ({ page, serverPort }) => {
		expect(itemsInCollectionAlgorithms.length).toBe(22);
		const customHandler = makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top', itemsInCollectionAlgorithms);
		server = await getServer('mobile-test-user-item-details-view-edit', serverPort, customHandler);

		await page.goto(`http://localhost:${serverPort}/testuser/collections/CSB4KZUU/items/3JCLFUG4/item-details`);
		await waitForLoad(page);

		const addRelatedButton = await page.getByRole('button', { name: 'Add Related Item' });
		await addRelatedButton.dispatchEvent('click'); // Use dispatchEvent to avoid switching to desktop mode on ipad-pro-landscape-emulator

		const modal = page.getByRole('dialog', { name: 'Add Related Items' });
		await expect(modal).toBeVisible();

		await page.waitForFunction(() => document.querySelector('.add-related-modal').classList.contains('ReactModal__Content--after-open'));
		await page.waitForFunction(() => document.querySelector('.add-related-modal').querySelectorAll('.item').length > 0); // 22 items is enough to trigger virtual scrolling so we cannot check for exact count
		await wait(500); // ensure animation has settled and icons are loaded
		await expect(page).toHaveScreenshot(`mobile-item-add-related.png`);
		await page.close();
	});
});

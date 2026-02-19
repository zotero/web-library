import { getServer, closeServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait, waitForLoad } from '../utils/common.js';
import itemsInCollectionDogs from '../fixtures/response/test-user-get-items-in-collection-dogs.json' assert { type: 'json' };
import testUserManageTags from '../fixtures/response/test-user-manage-tags.json' assert { type: 'json' };

test.describe('Desktop Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test(`should render a list of items"`, async ({ page, serverPort }) => {
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

	test(`should render "Add Related" modal`, async ({ page, serverPort }) => {
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

	test('should render citations dialog', async ({ page, serverPort }) => {
		server = await getServer('desktop-test-user-item-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
		await waitForLoad(page);

		const citeButton = await page.getByRole('button', { name: 'Create Citations' });
		await citeButton.click();

		const dialog = await page.getByRole('dialog', { name: 'Copy Citation' });
		await expect(dialog).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.copy-citation-modal').classList.contains('ReactModal__Content--after-open'));
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`desktop-item-copy-citations.png`);
		await page.close();
	});

	test('should render bibliography dialog', async ({ page, serverPort }) => {
		server = await getServer('desktop-test-user-item-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
		await waitForLoad(page);

		const citeButton = await page.getByRole('button', { name: 'Create Bibliography' });
		await citeButton.click();

		const dialog = await page.getByRole('dialog', { name: 'Bibliography' });
		await expect(dialog).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.bibliography-modal').classList.contains('ReactModal__Content--after-open'));
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`desktop-item-bibliography.png`);
		await page.close();
	});

	test('should render tag manager dot menu dropdown', async ({ page, serverPort }) => {
		const tagsHandler = makeCustomHandler('/api/users/1/tags', testUserManageTags, { totalResults: 8 });
		const collectionTagsHandler = makeCustomHandler('/api/users/1/collections/WTTJ2J56/items/top/tags', [], { totalResults: 0 } );
		server = await getServer('desktop-test-user-item-view', serverPort, [tagsHandler, collectionTagsHandler]);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details`);
		await waitForLoad(page);

		await page.getByRole('button', { name: 'Tag Selector Options' }).click();
		await page.getByRole('menuitem', { name: 'Manage Tags' }).click();

		const modal = page.getByRole('dialog', { name: 'Manage Tags' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.manage-tags').classList.contains('ReactModal__Content--after-open'));

		const list = modal.getByRole('list', { name: 'Tags' });
		await expect(list.getByRole('listitem').first()).toBeVisible();

		const tagItem = list.getByRole('listitem', { name: 'to read' });
		await tagItem.getByRole('button', { name: 'More' }).click();

		await expect(page.getByRole('menuitem', { name: 'Assign Color' })).toBeVisible();
		await wait(500);
		await expect(page).toHaveScreenshot('desktop-tag-manager-dot-menu.png');
		await page.close();
	});

	test('should render flags, symbols and emoji in the items table', async ({ page, serverPort }) => {
		server = await getServer('item-with-emoji-and-flags', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/4VM2BFHN/items/IY45CHYB/collection`);
		await waitForLoad(page);
		await wait(500); // avoid flaky screenshot with missing icons

		const row = await page.getByRole('row', { name: 'Hip Hop in the United States'});
		await expect(row.locator('css=.emoji')).toHaveText('♫🎶🇺🇸');
		await expect(page).toHaveScreenshot(`desktop-item-flags-symbols-emoji.png`);
		await page.close();
	});
});

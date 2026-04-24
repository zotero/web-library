import { getServer, closeServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait, waitForLoad } from '../utils/common.js';
import itemsInCollectionDogs from '../fixtures/response/test-user-get-items-in-collection-dogs.json' assert { type: 'json' };
import testUserManageTags from '../fixtures/response/test-user-manage-tags.json' assert { type: 'json' };

test.describe('Desktop Modal Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
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

	// Disabled in 1.7.x only due to incompatibility with test network isolation fix
	test.skip('should render citations dialog', async ({ page, serverPort }) => {
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

	// Disabled in 1.7.x only due to incompatibility with test network isolation fix
	test.skip('should render bibliography dialog', async ({ page, serverPort }) => {
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
		const tagItem = list.getByRole('listitem', { name: 'to read' });
		await expect(tagItem).toBeVisible();
		await tagItem.getByRole('button', { name: 'More' }).click();

		await expect(page.getByRole('menuitem', { name: 'Assign Color' })).toBeVisible();
		await wait(500);
		await expect(page).toHaveScreenshot('desktop-tag-manager-dot-menu.png');
		await page.close();
	});
});

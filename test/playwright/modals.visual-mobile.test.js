import { closeServer, loadFixtureState, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait, isSingleColumn } from '../utils/common.js';
import itemsInCollectionAlgorithms from '../fixtures/response/test-user-get-items-in-collection-algorithms.json' with { type: 'json' };
import testUserManageTags from '../fixtures/response/test-user-manage-tags.json' with { type: 'json' };

test.describe('Mobile Modal Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('should render tag manager dot menu dropdown', async ({ page, serverPort }) => {
		const tagsHandler = makeCustomHandler('/api/users/1/tags', testUserManageTags, { totalResults: 8 });
		const handler = makeCustomHandler('/api/users/1/collections/WTTJ2J56/items/top/tags', [], { totalResults: 0 } );
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, [tagsHandler, handler]);

		if (isSingleColumn(test.info())) {
			await page.getByRole('button', { name: 'Toggle tag selector' }).tap();
		} else {
			await page.getByRole('button', { name: 'Open Tag Selector' }).tap();
		}

		await page.getByRole('button', { name: 'Tag Selector Options' }).tap();
		await page.getByRole('menuitem', { name: 'Manage Tags' }).tap();

		const modal = page.getByRole('dialog', { name: 'Manage Tags' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.manage-tags').classList.contains('ReactModal__Content--after-open'));

		const list = modal.getByRole('list', { name: 'Tags' });
		const tagItem = list.getByRole('listitem', { name: 'to read' });
		await expect(tagItem).toBeVisible();
		await tagItem.getByRole('button', { name: 'More' }).tap();

		await expect(page.getByRole('menuitem', { name: 'Assign Color' })).toBeVisible();
		await wait(500);
		await expect(page).toHaveScreenshot('mobile-tag-manager-dot-menu.png');
		await page.close();
	});

	test('should render "Add Related" modal', async ({ page, serverPort }) => {
		expect(itemsInCollectionAlgorithms.length).toBe(23);
		const customHandler = makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top', itemsInCollectionAlgorithms);
		server = await loadFixtureState('mobile-test-user-item-details-view-edit', serverPort, page, customHandler);

		const addRelatedButton = await page.getByRole('button', { name: 'Add Related Item' });
		await addRelatedButton.tap();

		const modal = page.getByRole('dialog', { name: 'Add Related Items' });
		await expect(modal).toBeVisible();

		await page.waitForFunction(() => document.querySelector('.add-related-modal').classList.contains('ReactModal__Content--after-open'));
		await page.waitForFunction(() => document.querySelector('.add-related-modal').querySelectorAll('.item').length > 0); // 23 items is enough to trigger virtual scrolling so we cannot check for exact count
		await wait(500); // ensure animation has settled and icons are loaded
		await expect(page).toHaveScreenshot(`mobile-item-add-related.png`);
		await page.close();
	});
});

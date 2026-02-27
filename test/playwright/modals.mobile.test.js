import { loadFixtureState, closeServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import itemsInCollectionAlgorithms from '../fixtures/response/test-user-get-items-in-collection-algorithms.json' assert { type: 'json' };

test.describe('Mobile Modals', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('should focus input in New Subcollection modal', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-library-view', serverPort, page);

		// Open the "More" dropdown on the "AI" collection.
		// Use dispatchEvent to bypass Playwright's pointer-interception check --
		// on iPad the expanded "Dogs" subcollection list visually overlaps sibling tree items.
		const aiTreeItem = page.getByRole('treeitem', { name: 'AI' });
		await expect(aiTreeItem).toBeVisible();
		const moreButton = aiTreeItem.getByTitle('More');
		await moreButton.dispatchEvent('click');

		// Click "New Subcollection"
		const menuItem = page.getByRole('menuitem', { name: 'New Subcollection' });
		await expect(menuItem).toBeVisible();
		await menuItem.click();

		// Wait for the modal to appear and settle
		const modal = page.getByRole('dialog', { name: 'Add a New Collection' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() =>
			document.querySelector('.new-collection')?.classList.contains('ReactModal__Content--after-open')
		);

		// Wait for the slide transition to complete (500ms CSS transition)
		// The focusOnModalOpen utility waits for transitionend, so we just need
		// to wait long enough for the transition + focus to settle
		await page.waitForTimeout(600);

		// Verify that focus is placed on the input
		const input = modal.getByRole('textbox');
		await expect(input).toBeFocused();

		await page.close();
	});

	test('should open Change Parent Item modal without changing view', async ({ page, serverPort }) => {
		const customHandler = makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top', itemsInCollectionAlgorithms);
		server = await loadFixtureState('mobile-test-user-item-details-view-edit', serverPort, page, customHandler);

		const urlBefore = page.url();

		const fullText = page.getByRole('listitem', { name: 'Full Text' });
		await expect(fullText).toBeVisible();
		const optionsButton = fullText.getByRole('button', { name: 'Attachment Options' });
		await optionsButton.dispatchEvent('click');

		const menuItem = page.getByRole('menuitem', { name: 'Change Parent Item' });
		await expect(menuItem).toBeVisible();
		await menuItem.dispatchEvent('click');

		// Wait for the modal to appear and settle
		const modal = page.getByRole('dialog', { name: 'Change Parent Item' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() =>
			document.querySelector('.change-parent-item-modal')?.classList.contains('ReactModal__Content--after-open')
		);

		// Wait for the slide transition to complete
		await page.waitForTimeout(600);

		// The modal should still be visible
		await expect(modal).toBeVisible();

		// The URL should not have changed -- opening the modal should not navigate
		// to the attachment details view
		expect(page.url()).toBe(urlBefore);

		await page.close();
	});
});

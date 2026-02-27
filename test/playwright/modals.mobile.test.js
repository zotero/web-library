import { loadFixtureState, closeServer } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';

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
});

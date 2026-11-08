import { closeServer, loadFixtureState } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait } from '../utils/common.js';

test.describe('Desktop Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test(`should render a list of items"`, async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);
		const itemsList = await page.getByRole('grid', { name: 'items' });
		expect(await itemsList.getByRole('row').count()).toBe(8); // 7 items + header row
		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page).toHaveScreenshot(`desktop-items-list.png`);
		await page.close();
	});

	test('should render selected collection with focused More button', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);
		// Tab to activate keyboard mode and focus the collection tree
		await page.keyboard.press('Tab');
		// Navigate down to the collection "Dogs" (selected)
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'Dogs' })).toBeFocused();
		// Press ArrowRight to open the subtree ("Dogs" collection has subcollections)
		await page.keyboard.press('ArrowRight');
		// Press ArrowRight again to focus on the "More" button
		await page.keyboard.press('ArrowRight');
		await expect(page
			.getByRole('treeitem', { name: 'Dogs' })
			.getByRole('button', { name: 'More' })
		).toBeFocused();
		await wait(500);
		await expect(page).toHaveScreenshot('desktop-collection-tree-more-focused.png');
		await page.close();
	});

	test('should render note with dropdown focused and opened', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-note-view', serverPort, page);

		const note = page.locator('.note.selected');
		await note.focus();

		// Move focus to the "Note Options" dropdown toggle
		await page.keyboard.press('ArrowRight');
		await expect(note.getByRole('button', { name: 'Note Options' })).toBeFocused();

		// Open the dropdown
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeVisible();

		await wait(500);
		await expect(page).toHaveScreenshot('desktop-note-dropdown-focused.png');
		await page.close();
	});

	test('should render standalone attachment with a note and a long filename', async ({ page, serverPort }) => {
		// Underscores offer no line break opportunity, so the filename can only wrap anywhere
		const filename = 'Attention_Is_All_You_Need_Vaswani_Shazeer_Parmar_Uszkoreit_Jones_Gomez_Kaiser_Polosukhin_NeurIPS_2017.pdf';
		server = await loadFixtureState('desktop-test-user-top-level-attachment-view', serverPort, page, [], {
			patchState: state => {
				state.libraries.u1.items[state.current.itemKey].filename = filename;
				state.libraries.u1.dataObjects[state.current.itemKey].filename = filename;
				return state;
			}
		});

		const pane = page.getByRole('tabpanel', { name: 'Info' });
		await expect(pane.getByText(filename)).toBeVisible();
		await expect(pane.locator('.editor-container.initialized')).toBeVisible();
		await expect(pane.frameLocator('iframe').getByText('This is an attachment note')).toBeVisible();
		await wait(500); // avoid flaky screenshot with missing icons
		// A column pushed out of the pane changes little more than glyphs, as the editor and pane
		// backgrounds fall within the colour threshold, hence the tighter ratio on the pane alone
		await expect(page.locator('.item-details')).toHaveScreenshot('desktop-standalone-attachment-note.png', {
			maxDiffPixelRatio: 0.005,
		});
		await page.close();
	});

	test('should render flags, symbols and emoji in the items table', async ({ page, serverPort }) => {
		server = await loadFixtureState('item-with-emoji-and-flags', serverPort, page);
		await wait(500); // avoid flaky screenshot with missing icons

		const row = await page.getByRole('row', { name: 'Hip Hop in the United States'});
		await expect(row.locator('css=.emoji')).toHaveText('♫🎶🇺🇸');
		await expect(page).toHaveScreenshot(`desktop-item-flags-symbols-emoji.png`);
		await page.close();
	});
});

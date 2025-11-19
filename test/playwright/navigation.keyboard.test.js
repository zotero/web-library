import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, loadFixtureState, makeTextHandler} from "../utils/fixed-state-server.js";


test.describe('Navigate through the UI using keyboard', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('Tabulate through the UI', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await expect(await page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('button', {name: 'Collapse Tag Selector'})).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('button', {name: 'cute'})).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('searchbox', {name: 'Filter Tags'})).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('button', {name: 'New Item'})).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('row', {name: 'Effects of diet restriction on life span and age-related changes in dogs'})).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('tab', {name: 'Info'})).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('combobox', {name: 'Item Type'}).getByRole('textbox')).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('textbox', {name: 'Title', exact: true })).toBeFocused();

		await page.keyboard.press('Tab');
		await expect(await page.getByRole('combobox', {name: 'Creator Type'}).first()).toBeFocused();
	});

	test('Tabulate back through the UI', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('textbox', {name: 'Title', exact: true}).click();
		await expect(await page.getByRole('textbox', {name: 'Title', exact: true})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('combobox', {name: 'Item Type'}).getByRole('textbox')).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('tab', {name: 'Info'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('row', {name: 'Effects of diet restriction on life span and age-related changes in dogs'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('button', {name: 'New Item'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('searchbox', {name: 'Filter Tags'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('button', {name: 'cute'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('button', {name: 'Collapse Tag Selector'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('treeitem', {name: 'My Library'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(await page.getByRole('searchbox', {name: 'Title, Creator, Year'})).toBeFocused();
	});

	test('Tabbing back to item details tabs should focus on the last selected tab', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('tab', {name: 'Tags'}).click();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', {name: 'Add Tag'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(page.getByRole('tab', {name: 'Tags'})).toBeFocused();
	});

	test('Navigate through attachments pane using keyboard', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/items/37V7V4NT/file/view/url', 'https://files.zotero.net/abcdefgh/18726.html'),
			makeTextHandler('/api/users/1/items/K24TUDDL/file/view/url', 'https://files.zotero.net/abcdefgh/Silver%20-%202005%20-%20Cooperative%20pathfinding.pdf')
		];
		server = await loadFixtureState('desktop-test-user-attachment-in-collection-view', serverPort, page, handlers);

		await page.getByRole('tab', {name: 'Attachments'}).focus();

		await page.keyboard.press('Tab');
		await expect(page.getByLabel('Add File')).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('button', {name: 'Add Linked URL'})).toBeFocused();

		await page.keyboard.press('Shift+Tab');
		await expect(page.getByRole('tab', {name: 'Attachments'})).toBeFocused();

		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await expect(page.getByRole('listitem', {name: 'Snapshot'})).toBeFocused();

		await page.keyboard.press('ArrowUp');
		await expect(page.getByRole('listitem', {name: 'Full Text'})).toBeFocused();

		await page.keyboard.press('ArrowUp');
		await expect(page.getByLabel('Add File')).toBeFocused();

		await page.keyboard.press('ArrowDown');
		const listItem = page.getByRole('listitem', {name: 'Full Text'});
		await expect(listItem).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(listItem.getByRole('button', {name: 'Open In Reader'})).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(listItem.getByRole('button', {name: 'Export Attachment With Annotations'})).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(listItem.getByRole('button', { name: 'Attachment Options' })).toBeFocused();
	})

	test('Navigate through collections tree using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.keyboard.press('Tab');
		await expect(page.locator('html')).toHaveClass(/keyboard/);
		await expect(page.getByRole('treeitem', {name: 'My Library'})).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('button', {name: 'Add Collection'})).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', {name: 'AI'})).toBeFocused();
	});

	test('Navigate through items table using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('row', {
			name: 'Effects of diet restriction on life span and age-related changes in dogs'
		}).click();

		await page.keyboard.press('ArrowDown');

		await expect(page.getByRole('row', {
			name: 'Genius of Dogs: Discovering The Unique Intelligence Of Man\'s Best Friend: Amazon.co.uk: Hare, Brian, Woods, Vanessa: 9781780743684: Books'
		})).toBeFocused();

		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowUp');

		await expect(page.getByRole('columnheader', {name: 'Title'})).toBeFocused();

		await page.keyboard.press('ArrowRight');

		await expect(page.getByRole('columnheader', {name: 'Creator'})).toBeFocused();
	});

	test('Select multiple items using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('row', {
			name: 'Effects of diet restriction on life span and age-related changes in dogs'
		}).focus();

		await page.keyboard.down('Shift');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.up('Shift');

		await expect(page.getByRole('row', {selected: true})).toHaveCount(3);
		await expect(page.getByText('3 items selected')).toBeVisible();

		await page.keyboard.down('Shift');
		await page.keyboard.press('ArrowUp');
		await page.keyboard.up('Shift');

		await expect(page.getByRole('row', {selected: true})).toHaveCount(2);
		await expect(page.getByText('2 items selected')).toBeVisible();
	});

	test('Navigate through the toolbar and items table using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('button', {name: 'New Item'}).focus();

		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('button', {name: 'Column Selector'})).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('button', {name: 'More'})).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('button', {name: 'Create Bibliography'})).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('button', {name: 'More'})).toBeFocused();
	});

	test('Navigate through navbar using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('button', {name: 'Search Mode'})).toBeFocused();
	});

	test('Navigate through tag selector using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('button', {name: 'cute'}).focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('button', {name: 'to read'})).toBeFocused();
	});
});

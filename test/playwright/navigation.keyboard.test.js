import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, loadFixtureState, makeCustomHandler, makeTextHandler} from "../utils/fixed-state-server.js";
import testUserManageTags from '../fixtures/response/test-user-manage-tags.json' assert { type: 'json' };
import identifierSearchResults from '../fixtures/response/identifier-search-web-results.json' assert { type: 'json' };


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

	test('Focus returns to dropdown toggle on Escape in collection tree', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Wait for the page to be ready, then tab into the collection tree
		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// ArrowRight to reach the "More" button
		await page.keyboard.press('ArrowRight');
		const moreButton = page.getByTitle('More').first();
		await expect(moreButton).toBeFocused();

		// Open the dropdown with Enter
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Move Collection' })).toBeVisible();

		// Close the dropdown with Escape
		await page.keyboard.press('Escape');

		// Focus should return to the "More" toggle button
		await expect(moreButton).toBeFocused();
	});

	test('ArrowLeft inside open dropdown closes dropdown and returns focus to tree node', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Tab into collection tree, navigate to "AI"
		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// ArrowRight to reach the "More" button
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();

		// Open the dropdown with Enter
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();

		// Press ArrowLeft -- should close dropdown and focus the tree node
		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('menuitem', { name: 'Rename' })).not.toBeVisible();
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();
	});

	test('ArrowLeft from dropdown toggle moves focus back to tree node', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Tab into collection tree, navigate to "AI"
		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// ArrowRight to reach the "More" button (without opening)
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();

		// Press ArrowLeft -- should move focus back to tree node
		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();
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

	test('Navigate through the toolbar in trash view using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-trash-view', serverPort, page);

		// Tab through: searchbox -> collection tree -> collapse tag selector -> tag selector -> filter tags -> toolbar
		// In trash view, all toolbar buttons before "More" are disabled (no item selected), so focus lands on "More"
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', {name: 'More'})).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('button', {name: 'Column Selector'})).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('button', {name: 'More'})).toBeFocused();
	});

	test('Navigate through tag selector using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		await page.getByRole('button', {name: 'cute'}).focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.getByRole('button', {name: 'to read'})).toBeFocused();
	});

	test('Focus management in tag manager modal', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/tags', testUserManageTags, { totalResults: testUserManageTags.length }),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Open tag manager modal
		await page.getByRole('button', { name: 'Tag Selector Options' }).click();
		await page.getByRole('menuitem', { name: 'Manage Tags' }).click();

		const modal = page.getByRole('dialog', { name: 'Manage Tags' });
		await expect(modal).toBeVisible();

		// Focus is automatically put on the first focusable element inside the modal
		await expect(modal.getByRole('searchbox', { name: 'Filter Tags' })).toBeFocused();

		// Focus is trapped within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Manage Tags"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Manage Tags"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// The react-window scroll container should not be a tab stop (tabIndex=-1)
		await modal.getByRole('searchbox', { name: 'Filter Tags' }).focus();
		await expect(modal.getByRole('searchbox', { name: 'Filter Tags' })).toBeFocused();

		// Wait for tags to load in the list
		const tagList = modal.getByRole('list', { name: 'Tags' });
		await expect(tagList.locator('li.tag').first()).toBeVisible();

		// The react-window overflow container should have tabIndex=-1 to prevent it from being
		// an extra tab stop
		expect(await page.evaluate(() => {
			return document.querySelector('.tag-selector-list')?.getAttribute('tabindex');
		})).toBe('-1');

		// Tab from search input goes to the tag list, Shift+Tab goes back to the input
		// without any extra focus stops
		await page.keyboard.press('Tab');
		expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('LI');
		expect(await page.evaluate(() => document.activeElement?.classList.contains('tag'))).toBe(true);

		await page.keyboard.press('Shift+Tab');
		await expect(modal.getByRole('searchbox', { name: 'Filter Tags' })).toBeFocused();
	});

	test('Focus returns to trigger button after closing tag color manager', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/tags', testUserManageTags, { totalResults: testUserManageTags.length }),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Open tag manager modal
		await page.getByRole('button', { name: 'Tag Selector Options' }).click();
		await page.getByRole('menuitem', { name: 'Manage Tags' }).click();

		const modal = page.getByRole('dialog', { name: 'Manage Tags' });
		await expect(modal).toBeVisible();

		const tagList = modal.getByRole('list', { name: 'Tags' });
		const tagItem = tagList.getByRole('listitem', { name: 'to read' });
		await expect(tagItem).toBeVisible();

		// Open the dot menu for the tag, then open the tag color manager
		await tagItem.getByRole('button', { name: 'More' }).click();
		await page.getByRole('menuitem', { name: 'Assign Color' }).click();
		await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Close the tag color manager
		await page.getByRole('button', { name: 'Cancel' }).click();

		// Focus should return to the "More" button that triggered the edit
		await expect(tagItem.getByRole('button', { name: 'More' })).toBeFocused();
	});

	test('Focus is trapped within Change Parent Item modal', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/items/37V7V4NT/file/view/url', 'https://files.zotero.net/abcdefgh/18726.html'),
			makeTextHandler('/api/users/1/items/K24TUDDL/file/view/url', 'https://files.zotero.net/abcdefgh/Silver%20-%202005%20-%20Cooperative%20pathfinding.pdf'),
			makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-attachment-in-collection-view', serverPort, page, handlers);

		// Navigate to the Attachments tab and open the Change Parent Item modal via Snapshot's dropdown
		await page.getByRole('tab', { name: 'Attachments' }).click();
		const snapshot = page.getByRole('listitem', { name: 'Snapshot' });
		await snapshot.getByRole('button', { name: 'Attachment Options' }).click();
		await page.getByRole('menuitem', { name: 'Change Parent Item' }).click();

		const modal = page.getByRole('dialog', { name: 'Change Parent Item' });
		await expect(modal).toBeVisible();

		// Focus should be inside the modal
		expect(await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Change Parent Item"]');
			return modal?.contains(document.activeElement);
		})).toBe(true);

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Change Parent Item"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Change Parent Item"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is trapped within Add Related modal', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/collections/WTTJ2J56/items/top', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Navigate to the Related tab and open the Add Related modal
		await page.getByRole('tab', { name: 'Related' }).click();
		await page.getByRole('button', { name: 'Add Related Item' }).click();

		const modal = page.getByRole('dialog', { name: 'Add Related Items' });
		await expect(modal).toBeVisible();

		// Focus should be inside the modal
		expect(await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Add Related Items"]');
			return modal?.contains(document.activeElement);
		})).toBe(true);

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Add Related Items"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Add Related Items"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is trapped within Bibliography modal', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Open the Bibliography modal
		await page.getByRole('button', { name: 'Create Bibliography' }).click();

		const modal = page.getByRole('dialog', { name: 'Bibliography' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.bibliography-modal').classList.contains('ReactModal__Content--after-open'));

		// Focus should be on the "Copy to Clipboard" button
		await expect(modal.getByRole('button', { name: 'Copy to Clipboard' })).toBeFocused();

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Bibliography"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Bibliography"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is trapped within Copy Citation modal', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Open the Copy Citation modal
		await page.getByRole('button', { name: 'Create Citations' }).click();

		const modal = page.getByRole('dialog', { name: 'Copy Citation' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.copy-citation-modal').classList.contains('ReactModal__Content--after-open'));

		// Focus should be on the copy button in the footer
		await expect(modal.getByRole('button', { name: 'Copy Citation' })).toBeFocused();

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Copy Citation"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Copy Citation"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is trapped within Settings modal', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Open the Settings modal
		await page.getByRole('button', { name: 'Open Settings' }).click();

		const modal = page.getByRole('dialog', { name: 'Settings' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.modal-settings').classList.contains('ReactModal__Content--after-open'));

		// Focus should be on the first select (UI Density)
		expect(await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Settings"]');
			const select = modal?.querySelector('.form-group:first-child .select');
			return select?.contains(document.activeElement);
		})).toBe(true);

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Settings"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Settings"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is trapped within Select Collection modal opened via keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Focus the collection tree and navigate to "AI" collection
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// ArrowRight to reach the "More" button
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();

		// Open the dropdown with Enter
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Move Collection' })).toBeVisible();

		// Navigate to "Move Collection" and activate it
		await page.getByRole('menuitem', { name: 'Move Collection' }).focus();
		await page.keyboard.press('Enter');

		// The "Select Collection" modal should open
		const modal = page.getByRole('dialog', { name: 'Select Collection' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.collection-select-modal').classList.contains('ReactModal__Content--after-open'));

		// Focus should be on the collection tree inside the modal.
		// Use waitForFunction because the modal's onAfterOpen uses setTimeout(0) to set focus,
		// which may not have fired yet on Firefox when opened via keyboard through a dropdown.
		await page.waitForFunction(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Select Collection"]');
			const tree = modal?.querySelector('[aria-label="collection tree"]');
			return tree === document.activeElement || tree?.contains(document.activeElement);
		});

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Select Collection"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Select Collection"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is trapped within Add To Collection modal', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Click an item to select it
		await page.getByRole('row', {
			name: 'Effects of diet restriction on life span and age-related changes in dogs'
		}).click();

		// Click the "Add To Collection" toolbar button
		await page.getByRole('button', { name: 'Add To Collection' }).click();

		const modal = page.getByRole('dialog', { name: 'Select Collection' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.collection-select-modal').classList.contains('ReactModal__Content--after-open'));

		// Focus should be on the collection tree inside the modal
		expect(await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Select Collection"]');
			const tree = modal?.querySelector('[aria-label="collection tree"]');
			return tree === document.activeElement || tree?.contains(document.activeElement);
		})).toBe(true);

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Select Collection"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Select Collection"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is placed on input when Add By Identifier dialog opens', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Click the "Add By Identifier" toolbar button
		await page.getByRole('button', { name: 'Add By Identifier' }).click();

		// The dialog should be visible
		const dialog = page.getByRole('dialog', { name: 'Add By Identifier' });
		await expect(dialog).toBeVisible();

		// Focus should be on the input which has an accessible label via a <label> element
		await expect(dialog.getByRole('textbox', { name: /Enter a URL/ })).toBeFocused();
	});

	test('Focus is placed on search input in Style Installer modal and focus is trapped', async ({ page, serverPort }) => {
		const stylesData = [
			{ name: 'style-one', title: 'First Test Style' },
			{ name: 'style-two', title: 'Second Test Style' },
			{ name: 'style-three', title: 'Third Test Style' },
		];
		const handlers = [
			makeCustomHandler('/_styles', stylesData),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Open the Bibliography modal
		await page.getByRole('button', { name: 'Create Bibliography' }).click();
		const bibModal = page.getByRole('dialog', { name: 'Bibliography' });
		await expect(bibModal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.bibliography-modal').classList.contains('ReactModal__Content--after-open'));

		// Click on the Citation Style select to open the dropdown
		const styleCombobox = bibModal.getByRole('combobox', { name: 'Citation Style' });
		await styleCombobox.click();

		// Select the "N+ other styles available" option
		await page.getByRole('option', { name: /other styles available/ }).click();

		// Wait for the Style Installer modal to appear (styles data loads from mock endpoint)
		const styleModal = page.getByRole('dialog', { name: 'Citation Style Installer' });
		await expect(styleModal).toBeVisible();

		// Focus should be on the search input
		const searchInput = styleModal.getByRole('textbox', { name: 'Search Citation Styles' });
		await expect(searchInput).toBeFocused();

		// Search for fixture styles and verify they appear in the list
		await searchInput.fill('Test Style');
		await expect(styleModal.getByText('First Test Style')).toBeVisible();
		await expect(styleModal.getByText('Second Test Style')).toBeVisible();
		await expect(styleModal.getByText('Third Test Style')).toBeVisible();

		// Clear search to return to default list before testing focus trap
		await searchInput.fill('');

		// Focus is trapped within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Citation Style Installer"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Citation Style Installer"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is placed in Metadata Retrieval modal and focus is trapped', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/items/UMPPCXU4/file/view/url', 'http://localhost/attention.pdf'),
			makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top/tags', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-top-level-attachment-view', serverPort, page, handlers);

		// Click the "Retrieve Metadata" toolbar button
		await page.getByRole('button', { name: 'Retrieve Metadata' }).click();

		// The Metadata Retrieval modal should open
		const modal = page.getByRole('dialog', { name: 'Metadata Retrieval' });
		await expect(modal).toBeVisible();

		// The attachment should appear in the list and be focused
		const firstRow = modal.getByRole('row', { name: 'attention-is-all-you-need.pdf' });
		await expect(firstRow).toBeVisible();
		await expect(firstRow).toBeFocused();

		// Focus is trapped within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Metadata Retrieval"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Metadata Retrieval"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Focus is placed on input in Create Parent Item dialog and focus is trapped', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/items/UMPPCXU4/file/view/url', 'http://localhost/attention.pdf'),
			makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top/tags', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-top-level-attachment-view', serverPort, page, handlers);

		// Open the "More" dropdown in the toolbar and click "Create Parent Item"
		await page.getByRole('button', { name: 'More' }).click();
		await page.getByRole('menuitem', { name: 'Create Parent Item' }).click();

		// The Create Parent Item dialog should open
		const modal = page.getByRole('dialog', { name: 'Create Parent Item' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.create-parent-item-modal').classList.contains('ReactModal__Content--after-open'));

		// Focus should be on the input
		await expect(modal.getByRole('textbox', { name: /Enter a DOI/ })).toBeFocused();

		// Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Create Parent Item"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}

		// Shift+Tab multiple times -- focus should stay within the modal
		for (let i = 0; i < 5; i++) {
			await page.keyboard.press('Shift+Tab');
			expect(await page.evaluate(() => {
				const modal = document.querySelector('[role="dialog"][aria-label="Create Parent Item"]');
				return modal?.contains(document.activeElement);
			})).toBe(true);
		}
	});

	test('Identifier picker shows results and focuses Add button after search', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/_translate/web', identifierSearchResults),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Click the "Add By Identifier" toolbar button
		await page.getByRole('button', { name: 'Add By Identifier' }).click();
		const dialog = page.getByRole('dialog', { name: 'Add By Identifier' });
		await expect(dialog).toBeVisible();
		const identifierInput = dialog.getByRole('textbox', { name: /Enter a URL/ });
		await expect(identifierInput).toBeFocused();

		// Type a URL and submit
		await identifierInput.fill('https://example.com/database.bib');
		await page.keyboard.press('Enter');

		// The identifier picker modal should open with results
		const modal = page.locator('.identifier-picker-modal');
		await expect(modal).toBeVisible();
		await page.waitForFunction(() =>
			document.querySelector('.identifier-picker-modal')?.classList.contains('ReactModal__Content--after-open')
		);

		// Verify the results list contains all 3 items
		await expect(modal.getByText('Obstruction classes and local Euler characteristics')).toBeVisible();
		await expect(modal.getByText('Stratified Morse theory and applications')).toBeVisible();
		await expect(modal.getByText('Characteristic cycles and index theorems')).toBeVisible();

		// Focus should be on the "Add 3 Items" button (all items auto-selected for MULTIPLE result)
		await expect(modal.getByRole('button', { name: 'Add 3 Items' })).toBeFocused();
	});

	test('Dropdown focuses first item on every opening in collection tree', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Tab into collection tree, navigate to "AI"
		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// ArrowRight to reach the "More" button
		await page.keyboard.press('ArrowRight');
		const moreButton = page.getByRole('treeitem', { name: 'AI' }).getByTitle('More');
		await expect(moreButton).toBeFocused();

		// First opening: open the dropdown with Enter
		await page.keyboard.press('Enter');
		const renameItem = page.getByRole('menuitem', { name: 'Rename' });
		await expect(renameItem).toBeVisible();
		// The first non-disabled item ("Rename") should be focused
		await expect(renameItem).toBeFocused();

		// Close the dropdown with Escape
		await page.keyboard.press('Escape');
		await expect(renameItem).not.toBeVisible();
		await expect(moreButton).toBeFocused();

		// Second opening: open the dropdown again with Enter
		await page.keyboard.press('Enter');
		await expect(renameItem).toBeVisible();
		// The first non-disabled item ("Rename") should be focused again
		await expect(renameItem).toBeFocused();
	});

	test('Focus returns to toggle button after closing Move Collection modal', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Navigate to "AI" collection
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// Press ArrowRight to reach the "More" button, open the dropdown
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Move Collection' })).toBeVisible();

		// Activate "Move Collection"
		await page.getByRole('menuitem', { name: 'Move Collection' }).focus();
		await page.keyboard.press('Enter');

		// The modal should open
		const modal = page.getByRole('dialog', { name: 'Select Collection' });
		await expect(modal).toBeVisible();

		// Close the modal with Escape
		await page.keyboard.press('Escape');
		await expect(modal).not.toBeVisible();

		// Toggle button should be focused
		await expect(page.getByRole('treeitem', { name: 'AI' }).getByTitle('More')).toBeFocused();
	});

	test('Focus returns to toggle button after closing Bibliography modal', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/collections/I6WUED2Y/items/top', ''),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Navigate to "AI" collection and open DotMenu
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// Click the "More" button on AI's treeitem to open the DotMenu
		await page.getByRole('treeitem', { name: 'AI' }).getByTitle('More').click();
		await expect(page.getByRole('menuitem', { name: 'Create Bibliography' })).toBeVisible();

		// Click "Create Bibliography"
		await page.getByRole('menuitem', { name: 'Create Bibliography' }).click();

		// The Bibliography modal should open
		const modal = page.getByRole('dialog', { name: 'Bibliography' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() => document.querySelector('.bibliography-modal').classList.contains('ReactModal__Content--after-open'));

		// Close the modal with Escape
		await page.keyboard.press('Escape');
		await expect(modal).not.toBeVisible();

		// Toggle button should be focused
		await expect(page.getByRole('treeitem', { name: 'AI' }).getByTitle('More')).toBeFocused();
	});

	test('Focus returns to toggle button after closing Manage Tags modal', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/tags', testUserManageTags, { totalResults: testUserManageTags.length }),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Open the tag selector options dropdown
		await page.getByRole('button', { name: 'Tag Selector Options' }).click();
		await expect(page.getByRole('menuitem', { name: 'Manage Tags' })).toBeVisible();

		// Click "Manage Tags" to open the modal
		await page.getByRole('menuitem', { name: 'Manage Tags' }).click();
		const modal = page.getByRole('dialog', { name: 'Manage Tags' });
		await expect(modal).toBeVisible();

		// Close the modal with Escape
		await page.keyboard.press('Escape');
		await expect(modal).not.toBeVisible();

		// Toggle button should be focused
		await expect(page.getByRole('button', { name: 'Tag Selector Options' })).toBeFocused();
	});

	test('Focus returns to toggle button after closing Change Parent Item modal (notes)', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-note-view', serverPort, page, handlers);

		// Navigate to the Notes tab and open the dropdown for the note
		await page.getByRole('tab', { name: 'Notes' }).click();
		const noteItem = page.locator('.note').first();
		await expect(noteItem).toBeVisible();

		// Open the note's dropdown
		await noteItem.getByRole('button', { name: 'Note Options' }).click();
		await expect(page.getByRole('menuitem', { name: 'Change Parent Item' })).toBeVisible();

		// Click "Change Parent Item"
		await page.getByRole('menuitem', { name: 'Change Parent Item' }).click();
		const modal = page.getByRole('dialog', { name: 'Change Parent Item' });
		await expect(modal).toBeVisible();

		// Close the modal with Escape
		await page.keyboard.press('Escape');
		await expect(modal).not.toBeVisible();

		// Toggle button should be focused
		await expect(noteItem.getByRole('button', { name: 'Note Options' })).toBeFocused();
	});
});

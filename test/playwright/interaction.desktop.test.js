import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, generateTestItems, loadFixtureState, makeCustomHandler, makeGate, makeGatedHandler, makePaginatedHandler, makeTextHandler} from "../utils/fixed-state-server.js";
import testUserAddCollection from '../fixtures/response/test-user-add-collection.json' assert { type: 'json' };
import testUserRemoveItemFromCollection from '../fixtures/response/test-user-remove-item-from-collection.json' assert { type: 'json' };
import testUserTrashItem from '../fixtures/response/test-user-trash-item.json' assert { type: 'json' };

// Generate Zotero API items covering the whole desktop-test-user-library-view item list, so that
// indices 61-82 -- the unfetched range in that fixture -- can be served when the virtual list
// scrolls into the sparse zone. The full set is needed because it is served through
// makePaginatedHandler, which slices by the requested `start`/`limit`: a handler that ignores those
// lands the same items at whichever offset happened to be requested, shifting the indices the tests
// assert on. Indices 0-60 are already in the fixture state, so they are never re-requested.
function generateLibraryItems() {
	return generateTestItems(83, { keyPrefix: 'UNFCH', titlePrefix: 'Unfetched Item' });
}

test.describe('Desktop Interaction', () => {
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
		await expect(await page.getByRole('combobox', {name: 'Item Type'})).toBeFocused();

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
		await expect(await page.getByRole('combobox', {name: 'Item Type'})).toBeFocused();

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

	for (const fieldKey of ['url', 'publisher']) {
		test(`Enter commit in the ${fieldKey} field returns focus to the items table`, async ({ page, serverPort }) => {
			const gate = makeGate();
			const patchHandler = (req, resp) => {
				if (req.method !== 'PATCH' || !req.url.startsWith('/api/users/1/items/VR82JUX8')) {
					return false;
				}
				gate.ready.then(() => {
					resp.statusCode = 204;
					resp.setHeader('Last-Modified-Version', '100000');
					resp.end();
				});
				return true;
			};
			server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, [patchHandler]);
			const field = page.locator(`[data-key="${fieldKey}"]`);
			const row = page.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' });

			await field.locator('.editable').click();
			await expect(field.locator('.editable-control')).toBeFocused();
			await page.keyboard.type('Example');

			const patchRequest = page.waitForRequest(req => req.method() === 'PATCH');
			await page.keyboard.press('Enter');
			await patchRequest;
			await expect(row).toBeFocused();

			gate.release();
			await expect(field.locator('.editable-control')).toHaveCount(0);
			await expect(row).toBeFocused();
		});
	}

	test('Enter in a multi-line item pane field inserts a line break, Shift+Enter commits', async ({ page, serverPort }) => {
		const patchHandler = (req, resp) => {
			if (req.method !== 'PATCH' || !req.url.startsWith('/api/users/1/items/VR82JUX8')) {
				return false;
			}
			resp.statusCode = 204;
			resp.setHeader('Last-Modified-Version', '100000');
			resp.end();
			return true;
		};
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, [patchHandler]);
		const textarea = page.locator('[data-key="extra"] textarea');
		const row = page.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' });
		const patchRequests = [];
		page.on('request', req => req.method() === 'PATCH' && patchRequests.push(req));

		await page.locator('[data-key="extra"] .editable').click();
		await expect(textarea).toBeFocused();
		await textarea.evaluate(el => el.setSelectionRange(el.value.length, el.value.length));
		await page.keyboard.press('Enter');
		await page.keyboard.type('Second line');
		await expect(textarea).toBeFocused();
		await expect(textarea).toHaveValue('Publisher: Am Vet Med Assoc\nSecond line');

		await page.keyboard.press('Shift+Enter');
		await expect(row).toBeFocused();
		await expect(textarea).toHaveCount(0);
		expect(patchRequests).toHaveLength(1);
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

	test('Focus management when opening and closing Add Linked URL form', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/items/37V7V4NT/file/view/url', 'https://files.zotero.net/abcdefgh/18726.html'),
			makeTextHandler('/api/users/1/items/K24TUDDL/file/view/url', 'https://files.zotero.net/abcdefgh/Silver%20-%202005%20-%20Cooperative%20pathfinding.pdf')
		];
		server = await loadFixtureState('desktop-test-user-attachment-in-collection-view', serverPort, page, handlers);

		// Click the "Add Linked URL" button
		const addLinkedUrlButton = page.getByRole('button', { name: 'Add Linked URL' });
		await addLinkedUrlButton.click();

		// Wait for the slide-down animation to complete and the URL input to be visible
		const urlInput = page.locator('#linked-url-form-url');
		await expect(urlInput).toBeVisible();

		// Focus should be on the URL input (autoFocus)
		await expect(urlInput).toBeFocused();

		// Press Escape to close the form
		await page.keyboard.press('Escape');

		// Wait for the exit animation to complete (form unmounts after 500ms transition)
		await expect(urlInput).not.toBeVisible();

		// Focus should return to the "Add Linked URL" button
		await expect(addLinkedUrlButton).toBeFocused();
	});

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

	test('Focus returns to collection node after cancelling rename with Escape', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Tab into collection tree, navigate to "AI"
		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// ArrowRight to reach the "More" button, open the dropdown
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeVisible();

		// Activate "Rename"
		await page.getByRole('menuitem', { name: 'Rename' }).focus();
		await page.keyboard.press('Enter');

		// The rename input should appear and be focused
		const renameInput = page.getByRole('textbox', { name: 'Rename Collection' });
		await expect(renameInput).toBeVisible();
		await expect(renameInput).toBeFocused();

		// Press Escape to cancel the rename
		await page.keyboard.press('Escape');

		// Focus should return to the collection treeitem
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();
	});

	test('Tabbing away while a new subcollection is saving does not cancel it', async ({ page, serverPort }) => {
		const gate = makeGate();
		let postCount = 0;
		page.on('request', request => {
			if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/users/1/collections') {
				postCount++;
			}
		});
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, [
			makeGatedHandler('/api/users/1/collections', testUserAddCollection, gate)
		]);

		const dogsTreeItem = page.getByRole('treeitem', { name: 'Dogs' });
		await dogsTreeItem.hover();
		await dogsTreeItem.getByTitle('More').first().click();
		await page.getByRole('menuitem', { name: 'New Subcollection' }).click();
		const newCollectionInput = page.locator('.new-collection input');
		await expect(newCollectionInput).toBeFocused();

		await page.keyboard.type('Irish Setter');
		await page.keyboard.press('Enter');
		await expect.poll(() => postCount).toBe(1);

		await page.keyboard.press('Tab');
		await expect(newCollectionInput).toBeAttached();
		await expect(newCollectionInput).not.toBeFocused();

		gate.release();
		await expect(page.locator('[data-collection-key="COL12345"]')).toBeFocused();
		await expect(newCollectionInput).not.toBeAttached();
		expect(postCount).toBe(1);
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

		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(page.getByRole('button', {name: 'Search Mode'})).toBeFocused();
	});

	test('Navigate through the toolbar in trash view using keyboard', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-trash-view', serverPort, page);

		await expect(page.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeFocused();

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

	test('Scrolling collection tree closes open dot menu dropdown', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Navigate to "AI" and open its dot menu via keyboard (the "More" button
		// is only visible on hover/:focus-within)
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();
		await page.keyboard.press('Enter');

		const renameItem = page.getByRole('menuitem', { name: 'Rename' });
		await expect(renameItem).toBeVisible();

		// Scroll the collection tree -- should close the dropdown
		await page.evaluate(() => {
			document.querySelector('nav.collection-tree').dispatchEvent(new Event('scroll'));
		});

		await expect(renameItem).not.toBeVisible();
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

	test('Column Selector dropdown focuses first column option', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Focus the Column Selector button
		const columnSelector = page.getByRole('button', { name: 'Column Selector' });
		await columnSelector.focus();
		await expect(columnSelector).toBeFocused();

		// Open the dropdown via keyboard
		await page.keyboard.press('Enter');

		// The first menuitemcheckbox (Creator) should be focused
		const creatorOption = page.getByRole('menuitemcheckbox', { name: 'Creator' });
		await expect(creatorOption).toBeVisible();
		await expect(creatorOption).toBeFocused();
	});

	test('Focus remains in toolbar after Remove From Collection', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/items', testUserRemoveItemFromCollection),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Focus the "Remove From Collection" button and activate with Enter
		const removeButton = page.getByRole('button', { name: 'Remove From Collection' });
		await removeButton.focus();
		await expect(removeButton).toBeFocused();
		await page.keyboard.press('Enter');

		// After the item is removed from the collection, the button becomes disabled
		await expect(removeButton).toBeDisabled();

		// Focus should remain within the toolbar, not be lost to the body
		expect(await page.evaluate(() => {
			const toolbar = document.querySelector('[aria-label="items toolbar"]');
			return toolbar?.contains(document.activeElement);
		})).toBe(true);
	});

	test('Focus remains in toolbar after Move To Trash', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/items', testUserTrashItem),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Focus the "Move To Trash" button and activate with Enter
		const trashButton = page.getByRole('button', { name: 'Move To Trash' });
		await trashButton.focus();
		await expect(trashButton).toBeFocused();
		await page.keyboard.press('Enter');

		// After the item is trashed, the button becomes disabled
		await expect(trashButton).toBeDisabled();

		// Focus should remain within the toolbar, not be lost to the body
		expect(await page.evaluate(() => {
			const toolbar = document.querySelector('[aria-label="items toolbar"]');
			return toolbar?.contains(document.activeElement);
		})).toBe(true);
	});

	test('Shift+Tab from note editor iframe should move focus back to notes list', async ({ page, browserName, serverPort }) => {
		// Playwright's Firefox handles iframe focus entry differently than a real
		// browser -- Shift+Tab cycles through internal iframe elements instead of
		// exiting. Verified working manually in Firefox.
		test.skip(browserName === 'firefox', 'Firefox iframe Tab handling differs in Playwright vs real browser');
		server = await loadFixtureState('desktop-test-user-note-view', serverPort, page);

		// Navigate to the Notes tab
		const notesTab = page.getByRole('tab', { name: 'Notes' });
		await notesTab.click();

		// Locate the notes tab panel and its note list
		const notesPanel = page.getByRole('tabpanel', { name: 'Notes' });
		await expect(notesPanel).toBeVisible();
		const notesList = notesPanel.locator('.scroll-container-mouse');
		await expect(notesList).toBeVisible();

		// Select the first note
		const noteItem = notesPanel.locator('.note').first();
		await expect(noteItem).toBeVisible();
		await noteItem.click();

		// Wait for the note editor iframe to appear
		const editorIframe = notesPanel.locator('.rich-editor iframe');
		await expect(editorIframe).toBeVisible();

		// Tab from the notes list into the note editor iframe
		await notesList.focus();
		await expect(notesList).toBeFocused();
		await page.keyboard.press('Tab');

		// The iframe should now be focused
		await expect(editorIframe).toBeFocused();

		// Shift+Tab from the iframe should move focus back to the notes list
		await page.keyboard.press('Shift+Tab');
		await expect(noteItem).toBeFocused();
	});

	test('PageDown into unfetched items selects the target row once loaded', async ({ page, serverPort }) => {
		const libraryItems = generateLibraryItems();
		const handlers = [
			makePaginatedHandler('/api/users/1/items/top', libraryItems),
			// catch-all for any other API requests (e.g. tags, item details)
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, handlers);

		// Click on the first row to select it and give the table keyboard focus
		await page.locator('[role="row"][data-index="0"]').click();
		await expect(page.locator('[role="row"][data-index="0"]')).toHaveAttribute('aria-selected', 'true');

		// Press PageDown repeatedly until the selected row is in the unfetched
		// zone (indices > 60). Each press jumps ~18 rows (viewport height / row
		// height), so ~4 presses from index 0 should reach the unfetched zone.
		// A small delay between presses ensures React has finished re-rendering
		// and the scroll container ref (outerRef) is set before the next press.
		let selectedIndex = 0;
		for (let i = 0; i < 8 && selectedIndex <= 60; i++) {
			await page.keyboard.press('PageDown');
			await page.waitForFunction(
				(prev) => {
					const sel = document.querySelector('.items-table [role="row"][aria-selected="true"]');
					return sel && parseInt(sel.dataset.index) !== prev;
				},
				selectedIndex,
			);
			selectedIndex = await page.evaluate(() => {
				const sel = document.querySelector('.items-table [role="row"][aria-selected="true"]');
				return sel ? parseInt(sel.dataset.index) : -1;
			});
			await page.waitForTimeout(100);
		}

		// Verify the selected row is in the unfetched zone
		expect(selectedIndex).toBeGreaterThan(60);

		// Verify focus is within the items table
		expect(await page.evaluate(() => {
			const table = document.querySelector('.items-table');
			return table?.contains(document.activeElement);
		})).toBe(true);

		// Arrow keys should navigate from the new position
		await page.keyboard.press('ArrowUp');
		const prevRow = page.locator(`.items-table [role="row"][data-index="${selectedIndex - 1}"]`);
		await expect(prevRow).toHaveAttribute('aria-selected', 'true');
	});

	test('End key navigates to unfetched last item and selects it once loaded', async ({ page, serverPort }) => {
		const libraryItems = generateLibraryItems();
		const handlers = [
			makePaginatedHandler('/api/users/1/items/top', libraryItems),
			// catch-all for any other API requests
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, handlers);

		// Click on the first row to select it and give the table keyboard focus
		const firstRow = page.locator('.items-table [role="row"][data-index="0"]');
		await firstRow.click();
		await expect(firstRow).toHaveAttribute('aria-selected', 'true');

		// Press End to jump to the last item (index 82, which is unfetched)
		await page.keyboard.press('End');

		// Wait for the last row to become selected (pending selection effect
		// dispatches navigation after the API response loads the item data)
		const lastRow = page.locator('.items-table [role="row"][data-index="82"]');
		await expect(lastRow).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });

		// Verify focus is within the items table
		expect(await page.evaluate(() => {
			const table = document.querySelector('.items-table');
			return table?.contains(document.activeElement);
		})).toBe(true);

		// Arrow keys should navigate from the last item
		await page.keyboard.press('ArrowUp');
		const prevRow = page.locator('.items-table [role="row"][data-index="81"]');
		await expect(prevRow).toHaveAttribute('aria-selected', 'true');
	});

	test('Shift+PageDown into unfetched items extends selection from anchor', async ({ page, serverPort }) => {
		const libraryItems = generateLibraryItems();
		const handlers = [
			makePaginatedHandler('/api/users/1/items/top', libraryItems),
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, handlers);

		// Click on first row, then PageDown to navigate near the unfetched zone
		await page.locator('[role="row"][data-index="0"]').click();
		await expect(page.locator('[role="row"][data-index="0"]')).toHaveAttribute('aria-selected', 'true');

		// Navigate to near the boundary (indices 0-60 are fetched, 61+ are not).
		// Use PageDown (without shift) to get close to the boundary.
		// A small delay between presses ensures outerRef is set after re-render.
		let anchorIndex = 0;
		for (let i = 0; i < 3; i++) {
			await page.keyboard.press('PageDown');
			await page.waitForFunction(
				(prev) => {
					const sel = document.querySelector('.items-table [role="row"][aria-selected="true"]');
					return sel && parseInt(sel.dataset.index) !== prev;
				},
				anchorIndex,
			);
			anchorIndex = await page.evaluate(() => {
				const sel = document.querySelector('.items-table [role="row"][aria-selected="true"]');
				return sel ? parseInt(sel.dataset.index) : -1;
			});
			await page.waitForTimeout(100);
		}

		// Now Shift+PageDown to extend selection into the unfetched zone
		await page.keyboard.press('Shift+PageDown');

		// Wait for multiple rows to become selected (shift extends the range)
		await page.waitForFunction(
			() => {
				const rows = document.querySelectorAll('.items-table [role="row"][aria-selected="true"]');
				return rows.length > 1;
			},
			{ timeout: 10000 }
		);

		const selectedIndices = await page.evaluate(() => {
			const rows = document.querySelectorAll('.items-table [role="row"][aria-selected="true"]');
			return Array.from(rows).map(r => parseInt(r.dataset.index)).sort((a, b) => a - b);
		});

		// Selection should include the anchor and extend contiguously into the unfetched zone
		expect(selectedIndices[0]).toBe(anchorIndex);
		expect(selectedIndices[selectedIndices.length - 1]).toBeGreaterThan(60);
		expect(selectedIndices.length).toBeGreaterThan(1);
		// Verify the range is contiguous
		for (let i = 1; i < selectedIndices.length; i++) {
			expect(selectedIndices[i]).toBe(selectedIndices[i - 1] + 1);
		}
	});

	test('Shift+End into unfetched items falls back to selecting last item when range has holes', async ({ page, serverPort }) => {
		const libraryItems = generateLibraryItems();
		const handlers = [
			makePaginatedHandler('/api/users/1/items/top', libraryItems),
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, handlers);

		// Select the first row as anchor. Items 0-60 are pre-fetched, 61-82
		// are not. The range 0-82 will have sparse holes, so the shift
		// extension falls back to selecting only the target (last item).
		await page.locator('[role="row"][data-index="0"]').click();
		await expect(page.locator('[role="row"][data-index="0"]')).toHaveAttribute('aria-selected', 'true');

		// Shift+End to attempt extending selection to the last item
		await page.keyboard.press('Shift+End');

		// The last row should become selected (via fallback single selection)
		const lastRow = page.locator('.items-table [role="row"][data-index="82"]');
		await expect(lastRow).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });

		// Verify focus is within the items table
		expect(await page.evaluate(() => {
			const table = document.querySelector('.items-table');
			return table?.contains(document.activeElement);
		})).toBe(true);

		// Arrow keys should navigate from the last item
		await page.keyboard.press('ArrowUp');
		const prevRow = page.locator('.items-table [role="row"][data-index="81"]');
		await expect(prevRow).toHaveAttribute('aria-selected', 'true');
	});

	test('Shift+Tab from standalone attachment note editor iframe should move focus back to download options', async ({ page, browserName, serverPort }) => {
		test.skip(browserName === 'firefox', 'Firefox iframe Tab handling differs in Playwright vs real browser');
		const handlers = [
			makeTextHandler('/api/users/1/items/UMPPCXU4/file/view/url', 'https://files.zotero.net/abcdefgh/test.pdf')
		];
		server = await loadFixtureState('desktop-test-user-top-level-attachment-view', serverPort, page, handlers);

		// The standalone attachment tab should be active
		const attachmentPanel = page.locator('.tab-pane.standalone-attachment');
		await expect(attachmentPanel).toBeVisible();

		// Wait for the editor iframe to initialize
		const editorIframe = attachmentPanel.locator('.rich-editor iframe');
		await expect(editorIframe).toBeVisible();
		await expect(attachmentPanel.locator('.editor-container.initialized')).toBeVisible();

		// Focus the download options (directly before the iframe), then Tab into it
		const downloadOptions = attachmentPanel.locator('.download-options');
		await downloadOptions.focus();
		await page.keyboard.press('Tab');
		await expect(editorIframe).toBeFocused();

		// Shift+Tab from the iframe should move focus back to the download options
		await page.keyboard.press('Shift+Tab');
		await expect(downloadOptions.getByRole('button', { name: 'Open' })).toBeFocused();
	});
});

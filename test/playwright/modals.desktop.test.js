import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, generateTestItems, generateTestTags, loadFixtureState, makeCustomHandler, makePaginatedHandler, makeTextHandler} from "../utils/fixed-state-server.js";
import testUserManageTags from '../fixtures/response/test-user-manage-tags.json' assert { type: 'json' };
import identifierSearchResults from '../fixtures/response/identifier-search-web-results.json' assert { type: 'json' };
import itemsInCollectionAlgorithms from '../fixtures/response/test-user-get-items-in-collection-algorithms.json' assert { type: 'json' };

test.describe('Desktop Modal Focus Management', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
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
			makeCustomHandler('/api/users/1/collections/CSB4KZUU/items/top', itemsInCollectionAlgorithms),
		];
		server = await loadFixtureState('desktop-test-user-attachment-in-collection-view', serverPort, page, handlers);

		// Navigate to the Attachments tab and open the Change Parent Item modal via Full Text's dropdown.
		// Full Text is a PDF web attachment, so "Convert to Standalone Attachment" button is available.
		await page.getByRole('tab', { name: 'Attachments' }).click();
		const fullText = page.getByRole('listitem', { name: 'Full Text' });
		await fullText.getByRole('button', { name: 'Attachment Options' }).click();
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

		// Tab from the header into the collection tree, then Shift+Tab back.
		// Shift+Tab should return focus to the search input, not the dropdown toggle.
		await modal.getByRole('searchbox').focus();
		await expect(modal.getByRole('searchbox')).toBeFocused();

		await page.keyboard.press('Tab');
		expect(await page.evaluate(() => {
			const nav = document.querySelector('[role="dialog"][aria-label="Change Parent Item"] nav.collection-tree');
			return nav?.contains(document.activeElement);
		})).toBe(true);

		await page.keyboard.press('Shift+Tab');
		await expect(modal.getByRole('searchbox')).toBeFocused();

		// Arrow key navigation within the header
		await page.keyboard.press('ArrowLeft');
		await expect(modal.getByRole('button', { name: 'Search Mode' })).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(modal.getByRole('button', { name: 'Close Dialog' })).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('button', { name: 'Search Mode' })).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('searchbox')).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('button', { name: 'Close Dialog' })).toBeFocused();

		// Footer focus management tests.
		// Tab through: searchbox → collection tree → items table → footer.
		// Tabbing through the items table auto-selects the first item, enabling the Select button.
		// The footer's initialQuerySelector targets '.modal-footer-right button' (Select).
		await modal.getByRole('searchbox').focus();
		await page.keyboard.press('Tab'); // → collection tree
		await page.keyboard.press('Tab'); // → items table
		await page.keyboard.press('Tab'); // → footer

		await expect(modal.getByRole('button', { name: 'Select' })).toBeFocused();

		// Arrow key navigation between footer buttons
		await page.keyboard.press('ArrowLeft');
		await expect(modal.getByRole('button', { name: /Convert to Standalone/ })).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(modal.getByRole('button', { name: 'Select' })).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('button', { name: /Convert to Standalone/ })).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('button', { name: 'Select' })).toBeFocused();
	});

	test('PageDown navigates through unfetched items in Change Parent Item modal', async ({ page, serverPort }) => {
		const allItems = generateTestItems(83, { keyPrefix: 'PICK', titlePrefix: 'Picker Item', collections: ['CSB4KZUU'] });
		const handlers = [
			makeTextHandler('/api/users/1/items/37V7V4NT/file/view/url', 'https://files.zotero.net/abcdefgh/18726.html'),
			makeTextHandler('/api/users/1/items/K24TUDDL/file/view/url', 'https://files.zotero.net/abcdefgh/Silver%20-%202005%20-%20Cooperative%20pathfinding.pdf'),
			makePaginatedHandler('/api/users/1/collections/CSB4KZUU/items/top', allItems),
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-attachment-in-collection-view', serverPort, page, handlers);

		// Open the Change Parent Item modal
		await page.getByRole('tab', { name: 'Attachments' }).click();
		const fullText = page.getByRole('listitem', { name: 'Full Text' });
		await fullText.getByRole('button', { name: 'Attachment Options' }).click();
		await page.getByRole('menuitem', { name: 'Change Parent Item' }).click();

		const modal = page.getByRole('dialog', { name: 'Change Parent Item' });
		await expect(modal).toBeVisible();

		// Wait for items to load and click the first row to select it and
		// give the items table focus
		const firstRow = modal.locator('[role="row"][data-index="0"]');
		await expect(firstRow).toBeVisible();
		await firstRow.click();
		await expect(firstRow).toHaveAttribute('aria-selected', 'true');

		// Helper to get the selected row index
		const getSelectedIndex = () => page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Change Parent Item"]');
			const sel = modal?.querySelector('[role="row"][aria-selected="true"]');
			return sel ? parseInt(sel.dataset.index) : -1;
		});

		// First PageDown -- should move selection forward by one page
		await page.keyboard.press('PageDown');
		await page.waitForTimeout(300);
		const indexAfterFirst = await getSelectedIndex();
		expect(indexAfterFirst).toBeGreaterThan(0);

		// Second PageDown -- should advance further
		await page.keyboard.press('PageDown');
		await page.waitForTimeout(300);
		const indexAfterSecond = await getSelectedIndex();
		expect(indexAfterSecond).toBeGreaterThan(indexAfterFirst);

		// Third PageDown -- reaches the unfetched zone (> index 50). Once
		// items load, the pending selection should be resolved.
		await page.keyboard.press('PageDown');
		await page.waitForTimeout(1000);
		const indexAfterThird = await getSelectedIndex();
		expect(indexAfterThird).toBeGreaterThan(indexAfterSecond);

		// Focus should remain within the modal
		expect(await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Change Parent Item"]');
			return modal?.contains(document.activeElement);
		})).toBe(true);
	});

	test('Shift+PageDown extends selection through unfetched items in Add Related modal', async ({ page, serverPort }) => {
		const allItems = generateTestItems(83, { keyPrefix: 'RLAT', titlePrefix: 'Related Item', collections: ['WTTJ2J56'] });
		const handlers = [
			makePaginatedHandler('/api/users/1/collections/WTTJ2J56/items/top', allItems),
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Open the Add Related modal
		await page.getByRole('tab', { name: 'Related' }).click();
		await page.getByRole('button', { name: 'Add Related Item' }).click();

		const modal = page.getByRole('dialog', { name: 'Add Related Items' });
		await expect(modal).toBeVisible();

		// Wait for items to load and click the first row
		const firstRow = modal.locator('[role="row"][data-index="0"]');
		await expect(firstRow).toBeVisible();
		await firstRow.click();
		await expect(firstRow).toHaveAttribute('aria-selected', 'true');

		// Helper: get all selected row indices visible in the DOM
		const getSelectedIndices = () => page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Add Related Items"]');
			return Array.from(modal?.querySelectorAll('[role="row"][aria-selected="true"]') ?? [])
				.map(r => parseInt(r.dataset.index))
				.sort((a, b) => a - b);
		});

		// Shift+PageDown extends the selection forward by one page each press.
		// Each page is ~19 rows (viewport height ~502px / 26px row height).
		// Press until cursorIndex exceeds the initial fetch boundary (50 items).
		let prevMax = 0;
		for (let press = 0; press < 4; press++) {
			await page.keyboard.press('Shift+PageDown');

			// Wait for the selection to advance beyond the previous extent.
			// When the target is unfetched, give extra time for the fetch +
			// pending selection resolution.
			await page.waitForFunction(
				(prev) => {
					const modal = document.querySelector('[role="dialog"][aria-label="Add Related Items"]');
					const rows = modal?.querySelectorAll('[role="row"][aria-selected="true"]');
					if (!rows?.length) return false;
					const indices = Array.from(rows).map(r => parseInt(r.dataset.index));
					return Math.max(...indices) > prev;
				},
				prevMax,
				{ timeout: 10000 }
			);

			const indices = await getSelectedIndices();
			prevMax = Math.max(...indices);
		}

		// After 4 Shift+PageDown presses the cursor should be past the initial
		// fetch boundary (index > 50), confirming unfetched items were loaded
		expect(prevMax).toBeGreaterThan(50);

		// The selected range is contiguous from 0 to prevMax. Verify that
		// every visible row within that range is selected and every row
		// beyond is not.
		const visibleSelected = await getSelectedIndices();
		for (let i = 1; i < visibleSelected.length; i++) {
			expect(visibleSelected[i]).toBe(visibleSelected[i - 1] + 1);
		}

		const { selectedIndices, unselectedIndices } = await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Add Related Items"]');
			const rows = Array.from(modal?.querySelectorAll('[role="row"][data-index]') ?? []);
			const selected = [], unselected = [];
			for (const r of rows) {
				const idx = parseInt(r.dataset.index);
				if (isNaN(idx)) continue;
				(r.getAttribute('aria-selected') === 'true' ? selected : unselected).push(idx);
			}
			return { selectedIndices: selected.sort((a, b) => a - b), unselectedIndices: unselected.sort((a, b) => a - b) };
		});
		// All visible rows within the selection range (0..prevMax) must be selected
		expect(selectedIndices.every(i => i <= prevMax)).toBe(true);
		// All visible rows beyond the selection must not be selected
		expect(unselectedIndices.every(i => i > prevMax)).toBe(true);
		// There must be selected rows visible
		expect(selectedIndices.length).toBeGreaterThan(0);
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

		// Tab from the header into the collection tree, then Shift+Tab back.
		// Shift+Tab should return focus to the search input, not the dropdown toggle.
		await modal.getByRole('searchbox').focus();
		await expect(modal.getByRole('searchbox')).toBeFocused();

		await page.keyboard.press('Tab');
		expect(await page.evaluate(() => {
			const nav = document.querySelector('[role="dialog"][aria-label="Add Related Items"] nav.collection-tree');
			return nav?.contains(document.activeElement);
		})).toBe(true);

		await page.keyboard.press('Shift+Tab');
		await expect(modal.getByRole('searchbox')).toBeFocused();

		// Arrow key navigation within the header
		await page.keyboard.press('ArrowLeft');
		await expect(modal.getByRole('button', { name: 'Search Mode' })).toBeFocused();

		await page.keyboard.press('ArrowLeft');
		await expect(modal.getByRole('button', { name: 'Close Dialog' })).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('button', { name: 'Search Mode' })).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('searchbox')).toBeFocused();

		await page.keyboard.press('ArrowRight');
		await expect(modal.getByRole('button', { name: 'Close Dialog' })).toBeFocused();
	});

	// Disabled in 1.7.x only due to incompatibility with test network isolation fix
	test.skip('Focus is trapped within Bibliography modal', async ({ page, serverPort }) => {
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

	// Disabled in 1.7.x only due to incompatibility with test network isolation fix
	test.skip('Focus is trapped within Copy Citation modal', async ({ page, serverPort }) => {
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

		// Focus should be on the first select (UI Density).
		// Use waitForFunction because focusOnModalOpen defers focus via requestAnimationFrame,
		// which may not have fired yet when the --after-open class is already present.
		await page.waitForFunction(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Settings"]');
			const select = modal?.querySelector('.form-group:first-child .select');
			return select?.contains(document.activeElement);
		});

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

		// Focus should be on the collection tree inside the modal.
		// Use waitForFunction because focusOnModalOpen defers focus via requestAnimationFrame,
		// which may not have fired yet when the --after-open class is already present.
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

	// Disabled in 1.7.x only due to incompatibility with test network isolation fix
	test.skip('Focus is placed on search input in Style Installer modal and focus is trapped', async ({ page, serverPort }) => {
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

	// Disabled in 1.7.x only due to incompatibility with test network isolation fix
	test.skip('Focus returns to toggle button after closing Bibliography modal', async ({ page, serverPort }) => {
		const handlers = [
			makeTextHandler('/api/users/1/collections/I6WUED2Y/items/top', ''),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Navigate to "AI" collection
		await page.keyboard.press('Tab');
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.getByRole('treeitem', { name: 'AI' })).toBeFocused();

		// Press ArrowRight to reach the "More" button, open the dropdown
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTitle('More').first()).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('menuitem', { name: 'Create Bibliography' })).toBeVisible();

		// Activate "Create Bibliography"
		await page.getByRole('menuitem', { name: 'Create Bibliography' }).focus();
		await page.keyboard.press('Enter');

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

	test('Scrolling tag list closes open dot menu dropdown', async ({ page, serverPort }) => {
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

		// Open the dot menu for a tag
		await tagItem.getByRole('button', { name: 'More' }).click();
		const assignColor = page.getByRole('menuitem', { name: 'Assign Color' });
		await expect(assignColor).toBeVisible();

		// Scroll the tag list -- the capture-phase listener on .scroll-container should close the dropdown
		await page.evaluate(() => {
			document.querySelector('.manage-tags .tag-selector-list').dispatchEvent(new Event('scroll'));
		});

		await expect(assignColor).not.toBeVisible();
	});

	test('PageDown/PageUp/Home/End navigate through many tags in Manage Tags modal', async ({ page, serverPort }) => {
		const allTags = generateTestTags(200);
		const handlers = [
			makePaginatedHandler('/api/users/1/tags', allTags),
		];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		// Open tag manager modal
		await page.getByRole('button', { name: 'Tag Selector Options' }).click();
		await page.getByRole('menuitem', { name: 'Manage Tags' }).click();

		const modal = page.getByRole('dialog', { name: 'Manage Tags' });
		await expect(modal).toBeVisible();

		// Wait for tags to load in the list
		const tagList = modal.getByRole('list', { name: 'Tags' });
		await expect(tagList.locator('li.tag').first()).toBeVisible();

		// Tab into the tag list so the first tag gets focus
		await modal.getByRole('searchbox', { name: 'Filter Tags' }).focus();
		await page.keyboard.press('Tab');
		expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('LI');

		// Press End -- should scroll to and focus the last tag (index 199)
		await page.keyboard.press('End');
		await page.waitForFunction(
			() => document.activeElement?.dataset?.index === '199',
			{ timeout: 10000 }
		);
		expect(await page.evaluate(() => document.activeElement?.dataset?.index)).toBe('199');

		// Press Home -- should scroll back to and focus the first tag (index 0)
		await page.keyboard.press('Home');
		await page.waitForFunction(
			() => document.activeElement?.dataset?.index === '0',
			{ timeout: 10000 }
		);
		expect(await page.evaluate(() => document.activeElement?.dataset?.index)).toBe('0');

		// Press PageDown -- should jump forward by approximately one viewport page
		await page.keyboard.press('PageDown');
		await page.waitForFunction(
			() => {
				const idx = parseInt(document.activeElement?.dataset?.index);
				return !isNaN(idx) && idx > 0;
			},
			{ timeout: 5000 }
		);
		const indexAfterPageDown = await page.evaluate(() => parseInt(document.activeElement?.dataset?.index));
		expect(indexAfterPageDown).toBeGreaterThan(0);

		// Press PageUp -- should jump back toward the beginning
		await page.keyboard.press('PageUp');
		await page.waitForFunction(
			(prev) => {
				const idx = parseInt(document.activeElement?.dataset?.index);
				return !isNaN(idx) && idx < prev;
			},
			indexAfterPageDown,
			{ timeout: 5000 }
		);
		const indexAfterPageUp = await page.evaluate(() => parseInt(document.activeElement?.dataset?.index));
		expect(indexAfterPageUp).toBeLessThan(indexAfterPageDown);

		// Focus should remain within the modal throughout
		expect(await page.evaluate(() => {
			const modal = document.querySelector('[role="dialog"][aria-label="Manage Tags"]');
			return modal?.contains(document.activeElement);
		})).toBe(true);
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

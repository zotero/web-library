/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getAllByRole, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState, getPachtedStateMultiple, getPatchedState, getPatchedStateArray } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { getDerivedData } from '../src/js/common/item';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';
import stateGroupRaw from './fixtures/state/desktop-test-group-item-view.json';
import testGroupCollections from './fixtures/response/test-group-collections.json';
import testGroupAddItemToCollection from './fixtures/response/test-group-add-item-to-collection.json';
import testUserUpdateRelationAfterCopy from './fixtures/response/test-user-update-relation-after-copy.json';
import testUserChildren from './fixtures/response/test-user-children.json';
import testGroupCopyChildItems from './fixtures/response/test-group-copy-child-items.json';
import testUserAttachmentAnnotations from './fixtures/response/test-user-attachment-annotations.json';
import testGroupCopyAnnotations from './fixtures/response/test-group-copy-annotations.json';

const state = JSONtoState(stateRaw);
const stateGroup = JSONtoState(stateGroupRaw);

describe('Group libraries', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	applyAdditionalJestTweaks();
	setupMSWLifecycle(server);

	beforeEach(() => {
		delete window.location;
	});

	afterEach(() => {
		localStorage.clear();
	});

	test('should copy an item to a group library', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details' });;
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: getPatchedStateArray(state, 'config.libraries', 1, { isFileUploadAllowed: true })});
		await waitForPosition();

		let myLibVersion = state.libraries.u1.sync.version;
		let groupLibVersion = stateGroup.libraries.g5119976.sync.version;
		let groupItemsPostCount = 0;
		let userItemsPostCount = 0;
		let fileUploadRequests = false;

		server.use(
			http.get('https://api.zotero.org/groups/5119976/collections', async () => {
				return HttpResponse.json(testGroupCollections, {
					headers: { 'Total-Results': 3 },
				});
			}),
			http.get('https://api.zotero.org/groups/5119976/settings/tagColors', async () => {
				return HttpResponse.json({});
			}),
			http.post('https://api.zotero.org/groups/5119976/items', async ({request}) => {
				const items = await request.json();
				groupItemsPostCount++;
				if(groupItemsPostCount === 1) {
					expect(items[0].key).toBeUndefined();
					expect(items[0].title).toEqual('Effects of diet restriction on life span and age-related changes in dogs');
					return HttpResponse.json(testGroupAddItemToCollection, {
						headers: { 'Last-Modified-Version': ++groupLibVersion },
					});
				}
				if (groupItemsPostCount === 2) {
					expect(items.map(i => i.title)).toEqual(expect.arrayContaining(['Snapshot', 'Full Text']));
					return HttpResponse.json(testGroupCopyChildItems, {
						headers: { 'Last-Modified-Version': ++groupLibVersion },
					});
				}
				if (groupItemsPostCount === 3) {
					expect(items.map(i => i.annotationType)).toEqual(expect.arrayContaining(['highlight', 'note', 'highlight', 'image']));
					return HttpResponse.json(testGroupCopyAnnotations, {
						headers: { 'Last-Modified-Version': ++groupLibVersion },
					});
				}
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				userItemsPostCount++;
				if(userItemsPostCount === 1) {
					expect(items[0].key).toBe('VR82JUX8');
					expect(items[0].relations).toEqual({ 'owl:sameAs': "http://zotero.org/groups/5119976/items/TBBKEM8I" })
					return HttpResponse.json(testUserUpdateRelationAfterCopy, {
						headers: { 'Last-Modified-Version': ++myLibVersion },
					});
				}
				throw new Error('Unexpected request');
			}),
			http.get('https://api.zotero.org/users/1/items/VR82JUX8/children', async () => {
				// This is the parent item, this request is for the children of that item, we return the two attachments
				return HttpResponse.json(testUserChildren, {
					headers: { 'Total-Results': '2' },
				});
			}),
			http.get('https://api.zotero.org/users/1/items/MWVZPK6B/children', async () => {
				// This is the first attachment, this request is for the annotations for that attachment
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' },
				})
			}),
			http.get('https://api.zotero.org/users/1/items/VG79HDDM/file', async () => {
				// this is the second attachment, this request is for the annotations for that attachment
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' },
				})
			}),
			http.post('https://api.zotero.org/groups/5119976/items/ERER8Z7M/file', async ({request}) => {
				fileUploadRequests++;
				expect(await request.text()).toEqual('md5=39bf1f4635fb0a4b2b9de876ed865f89&filename=Kealy%20et%20al.%20-%202002%20-%20Effects%20of%20diet%20restriction%20on%20life%20span%20and%20age-r.pdf&filesize=248058&mtime=1673607166000');
				return HttpResponse.json({ exists: 1 }, {
					headers: { 'Last-Modified-Version': ++groupLibVersion },
				});
			}),
			http.get('https://api.zotero.org/users/1/items/VG79HDDM/children', async () => {
				return HttpResponse.json(testUserAttachmentAnnotations, {
					headers: { 'Total-Results': 4 },
				});
			}),
		);

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		const addBtn = screen.getByRole('button',
			{ name: 'Add To Collection' }
		);

		await user.click(addBtn);

		const dialog = await screen.findByRole('dialog', { name: 'Select Collection' });
		const librarySelectorNode = getByRole(dialog, 'treeitem', { name: 'Animals' });
		await user.click(getByRole(librarySelectorNode, 'button', { name: 'Expand' }));
		const collectionSelectorNode = getByRole(dialog, 'treeitem', { name: 'Dogs' });
		await user.click(collectionSelectorNode);
		await user.click(getByRole(dialog, 'button', { name: 'Add' }));

		await waitFor(() => expect(screen.queryByRole('dialog',
			{ name: 'Select Collection' }
			)).not.toBeInTheDocument()
		);

		await waitFor(() => expect(groupItemsPostCount).toBe(3));
		await waitFor(() => expect(userItemsPostCount).toBe(1));
		await waitFor(() => expect(fileUploadRequests).toBe(1));
	});

	test('should sort locally by addedBy', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/groups/5119976/animals/items/X9WEHDAN/item-list' });;
		const user = userEvent.setup();
		const preloadedState = getPachtedStateMultiple(stateGroup, [
			['libraries.g5119976.dataObjects.RQW7ZKYL.@@meta@@.createdByUser', { username: 'zotero' }],
			['libraries.g5119976.dataObjects.RQW7ZKYL.@@derived@@', { createdByUser: 'zotero' }],
			['libraries.g5119976.dataObjects.CWHXG6QF.@@meta@@.createdByUser', { username: 'Garfield'}],
			['libraries.g5119976.dataObjects.CWHXG6QF.@@derived@@', { createdByUser: 'Garfield' }],
			['libraries.g5119976.dataObjects.6ELC3UWC.@@meta@@.createdByUser', { username: 'HELLO TESTS'}],
			['libraries.g5119976.dataObjects.6ELC3UWC.@@derived@@', { createdByUser: 'HELLO TESTS' }],
		]);

		renderWithProviders(<MainZotero />, { preloadedState });

		await user.click(await screen.findByRole('button', { name: 'Column Selector' }));
		await user.click(screen.getByRole('menuitemcheckbox', { name: 'Added By' }));
		await user.click(await screen.findByRole('columnheader', { name: 'Added By' }));
		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');
		let rows = getAllByRole(gridBody, 'row');

		expect(getByRole(rows[0], 'gridcell', { name: 'zotero' })).toHaveTextContent('zotero');
		expect(getByRole(rows[1], 'gridcell', { name: 'Garfield' })).toHaveTextContent('Garfield');
		expect(getByRole(rows[2], 'gridcell', { name: 'HELLO TESTS' })).toHaveTextContent('HELLO TESTS');
		expect(getByRole(rows[3], 'gridcell', { name: 'testuser' })).toHaveTextContent('testuser');

		await user.click(await screen.findByRole('columnheader', { name: 'Added By' }));
		rows = getAllByRole(gridBody, 'row');

		expect(getByRole(rows[0], 'gridcell', { name: 'zotero' })).toHaveTextContent('zotero');
		expect(getByRole(rows[1], 'gridcell', { name: 'testuser' })).toHaveTextContent('testuser');
		expect(getByRole(rows[2], 'gridcell', { name: 'HELLO TESTS' })).toHaveTextContent('HELLO TESTS');
		expect(getByRole(rows[3], 'gridcell', { name: 'Garfield' })).toHaveTextContent('Garfield');

		await user.click(await screen.findByRole('columnheader', { name: 'Added By' }));
		rows = getAllByRole(gridBody, 'row');

		expect(getByRole(rows[0], 'gridcell', { name: 'Garfield' })).toHaveTextContent('Garfield');
		expect(getByRole(rows[1], 'gridcell', { name: 'HELLO TESTS' })).toHaveTextContent('HELLO TESTS');
		expect(getByRole(rows[2], 'gridcell', { name: 'testuser' })).toHaveTextContent('testuser');
		expect(getByRole(rows[3], 'gridcell', { name: 'zotero' })).toHaveTextContent('zotero');
	});

	test('should display name in the Added By column, falling back to username, but sort locally by username', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/groups/5119976/animals/items/X9WEHDAN/item-list' });
		const user = userEvent.setup();
		const patchedState = getPachtedStateMultiple(stateGroup, [
			['libraries.g5119976.dataObjects.RQW7ZKYL.@@meta@@.createdByUser', { username: 'zotero', name: 'Alice' }],
			['libraries.g5119976.dataObjects.CWHXG6QF.@@meta@@.createdByUser', { username: 'garfield', name: 'Zelda' }],
			['libraries.g5119976.dataObjects.6ELC3UWC.@@meta@@.createdByUser', { username: 'bob', name: '' }],
		]);
		// fixture state contains pre-computed derived data, recalculate it from the patched items
		const { mappings, itemTypes } = patchedState.meta;
		const { dataObjects, tagColors } = patchedState.libraries.g5119976;
		const stateWithDerived = getPachtedStateMultiple(patchedState,
			['X9WEHDAN', '6ELC3UWC', 'CWHXG6QF', 'RQW7ZKYL'].map(key => [
				`libraries.g5119976.dataObjects.${key}.@@derived@@`,
				getDerivedData(mappings, dataObjects[key], itemTypes, tagColors)
			])
		);
		// at runtime `items` is the same object as `dataObjects`, fixture state has separate copies
		const preloadedState = getPatchedState(stateWithDerived, 'libraries.g5119976', {
			items: stateWithDerived.libraries.g5119976.dataObjects
		});

		renderWithProviders(<MainZotero />, { preloadedState });

		await user.click(await screen.findByRole('button', { name: 'Column Selector' }));
		await user.click(screen.getByRole('menuitemcheckbox', { name: 'Added By' }));
		const addedByHeader = await screen.findByRole('columnheader', { name: 'Added By' });
		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		const getAddedByCells = () => getAllByRole(gridBody, 'row').map(
			row => getAllByRole(row, 'gridcell')[getAllByRole(grid, 'columnheader').indexOf(addedByHeader)]
		);

		await user.click(addedByHeader);
		await waitFor(() => expect(addedByHeader).toHaveAttribute('aria-sort', 'ascending'));
		// usernames: bob, garfield, testuser, zotero
		expect(getAddedByCells().map(c => c.textContent)).toEqual(['bob', 'Zelda', 'testuser', 'Alice']);

		await user.click(addedByHeader);
		await waitFor(() => expect(addedByHeader).toHaveAttribute('aria-sort', 'descending'));
		expect(getAddedByCells().map(c => c.textContent)).toEqual(['Alice', 'testuser', 'Zelda', 'bob']);
	});

	test('should show username for Added By and Modified By in item details when name is not set', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/groups/5119976/animals/items/X9WEHDAN/item-details' });
		const preloadedState = getPachtedStateMultiple(stateGroup, [
			['libraries.g5119976.items.X9WEHDAN.@@meta@@.lastModifiedByUser', { id: 2, username: 'otheruser', name: '' }],
		]);
		renderWithProviders(<MainZotero />, { preloadedState });
		await waitForPosition();

		expect(screen.getByRole('textbox', { name: 'Added By' })).toHaveTextContent('testuser');
		expect(screen.getByRole('textbox', { name: 'Modified By' })).toHaveTextContent('otheruser');
	});

	test('should show name for Added By and Modified By in item details when set', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/groups/5119976/animals/items/X9WEHDAN/item-details' });
		const preloadedState = getPachtedStateMultiple(stateGroup, [
			['libraries.g5119976.items.X9WEHDAN.@@meta@@.createdByUser', { name: 'Test User' }],
			['libraries.g5119976.items.X9WEHDAN.@@meta@@.lastModifiedByUser', { id: 2, username: 'otheruser', name: 'Other User' }],
		]);
		renderWithProviders(<MainZotero />, { preloadedState });
		await waitForPosition();

		expect(screen.getByRole('textbox', { name: 'Added By' })).toHaveTextContent('Test User');
		expect(screen.getByRole('textbox', { name: 'Modified By' })).toHaveTextContent('Other User');
	});
});

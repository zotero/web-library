/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { act, findByRole, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState, getPatchedState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';
import stateSearchRaw from './fixtures/state/desktop-test-user-search-phrase-selected.json';
import testuserAddCollection from './fixtures/response/test-user-add-collection.json';

const state = JSONtoState(stateRaw);
const stateSearch = JSONtoState(stateSearchRaw);

describe('Test User: Collections', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	applyAdditionalJestTweaks();

	beforeAll(() => {
		server.listen({
			onUnhandledRequest: (req) => {
				// https://github.com/mswjs/msw/issues/946#issuecomment-1202959063
				test(`${req.method} ${req.url} is not handled`, () => { });
			},
		});
	});

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details' });;
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Add a subcollection using "More" menu', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const dogsTreeItem = screen.getByRole('treeitem', { name: 'Dogs', expanded: false });
		await user.click(getByRole(dogsTreeItem, 'button', { name: 'More' }));
		const newSubCollectionOpt = await screen.findByRole('menuitem', { name: 'New Subcollection' });
		await user.click(newSubCollectionOpt);

		await screen.findByRole('treeitem', { name: 'Dogs', expanded: true });
		const newCollectionTextBox = await screen.findByRole('textbox', { name: 'New Collection' });
		expect(newCollectionTextBox).toHaveFocus();
		expect(newCollectionTextBox).toHaveValue('');

		let hasBeenPosted = false;
		server.use(
			http.post('https://api.zotero.org/users/1/collections', async ({request}) => {
				const collections = await request.json();
				expect(collections[0].name).toBe('Irish Setter');
				expect(collections[0].parentCollection).toBe('WTTJ2J56');
				hasBeenPosted = true;
				return HttpResponse.json(testuserAddCollection);
			}),
		);

		await user.type(newCollectionTextBox, 'Irish Setter{enter}', { skipClick: true });
		expect(await screen.findByRole('treeitem', { name: 'Irish Setter' })).toBeInTheDocument();
		expect(hasBeenPosted).toBe(true);
	});

	test('Cancel adding a subcollection restores focus to More button', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const dogsTreeItem = screen.getByRole('treeitem', { name: 'Dogs', expanded: false });
		await user.click(getByRole(dogsTreeItem, 'button', { name: 'More' }));
		const newSubCollectionOpt = await screen.findByRole('menuitem', { name: 'New Subcollection' });
		await user.click(newSubCollectionOpt);

		const newCollectionTextBox = await screen.findByRole('textbox', { name: 'New Collection' });
		expect(newCollectionTextBox).toHaveFocus();

		await user.keyboard('{Escape}');
		expect(screen.queryByRole('textbox', { name: 'New Collection' })).not.toBeInTheDocument();

		const dogsTreeItemAfter = screen.getByRole('treeitem', { name: 'Dogs' });
		await waitFor(() => expect(getByRole(dogsTreeItemAfter, 'button', { name: 'More' })).toHaveFocus());
	});

	test('Cancel adding a top-level collection restores focus to Add Collection button', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const myLibraryTreeItem = screen.getByRole('treeitem', { name: 'My Library' });
		await user.click(getByRole(myLibraryTreeItem, 'button', { name: 'Add Collection' }));

		const newCollectionTextBox = await screen.findByRole('textbox', { name: 'New Collection' });
		expect(newCollectionTextBox).toHaveFocus();

		await user.keyboard('{Escape}');
		expect(screen.queryByRole('textbox', { name: 'New Collection' })).not.toBeInTheDocument();

		await waitFor(() => expect(getByRole(myLibraryTreeItem, 'button', { name: 'Add Collection' })).toHaveFocus());
	});

	test('Rename a collection using "More" menu', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const dogsTreeItem = screen.getByRole('treeitem', { name: 'Dogs' });
		await userEvent.click(getByRole(dogsTreeItem, 'button', { name: 'More' }));
		const renameOpt = await screen.findByRole('menuitem', { name: 'Rename' });

		// there is a 100ms delay between clicking "Rename" and actually opening the rename box
		await user.click(renameOpt, 'Zotero');
		const renameCollectionBox = await findByRole(dogsTreeItem, 'textbox', { name: 'Rename Collection' }, { timeout: 3000 });
		await waitFor(() => expect(renameCollectionBox).toHaveFocus());
		expect(renameCollectionBox).toHaveValue('Dogs');
		expect(renameCollectionBox.selectionStart).toBe(0);
		expect(renameCollectionBox.selectionEnd).toBe(4);

		let hasBeenPatched = false;
		server.use(
			http.patch('https://api.zotero.org/users/1/collections/WTTJ2J56', async ({request}) => {
				const patch = await request.json();
				expect(patch.name).toBe('Cats');
				hasBeenPatched = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		await user.type(renameCollectionBox, 'Cats{enter}', { skipClick: true });
		expect(await screen.findByRole('treeitem', { name: 'Cats' })).toBeInTheDocument();
		expect(hasBeenPatched).toBe(true);
	});

	test('Rename a collection using double click', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const dogsTreeItem = screen.getByRole('treeitem', { name: 'Dogs' });
		await user.dblClick(dogsTreeItem);
		const renameCollectionBox = await findByRole(dogsTreeItem, 'textbox', { name: 'Rename Collection' });
		await waitFor(() => expect(renameCollectionBox).toHaveFocus());

		let hasBeenPatched = false;
		server.use(
			http.patch('https://api.zotero.org/users/1/collections/WTTJ2J56', async ({request}) => {
				const patch = await request.json();
				expect(patch.name).toBe('Cats');
				hasBeenPatched = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		await user.type(renameCollectionBox, 'Cats{enter}', { skipClick: true });
		expect(await screen.findByRole('treeitem', { name: 'Cats' })).toBeInTheDocument();
		expect(hasBeenPatched).toBe(true);
	});

	test('Trash a collection using "More" menu', async () => {
		const libVer = state.libraries.u1.sync.version;
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const collectionTreeItem = screen.getByRole('treeitem', { name: 'Algorithms' });
		await user.click(getByRole(collectionTreeItem, 'button', { name: 'More' }));
		const deleteOpt = await screen.findByRole('menuitem', { name: 'Delete' });

		let hasBeenTrashed = false;
		server.use(
			http.post('https://api.zotero.org/users/1/collections', async ({ request }) => {
				const collections = await request.json();
				expect(collections[0].deleted).toBe(1);
				expect(collections[0].key).toBe('CSB4KZUU');
				hasBeenTrashed = true;
				const responseBody = { success: { "0": 'CSB4KZUU' }, successful: { "0": { key: 'CSB4KZUU', version: libVer, data: { ...state.libraries.u1.dataObjects.CSB4KZUU, deleted: 1 } } } };
				return HttpResponse.json(responseBody);
			}),
		);

		await user.click(deleteOpt);
		await waitFor(() => expect(screen.queryByRole('treeitem', { name: 'Algorithms' })).not.toBeInTheDocument());
		expect(hasBeenTrashed).toBe(true);
	});

	test('Move a collection using "More" menu', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const dogsTreeItem = screen.getByRole('treeitem', { name: 'Dogs', expanded: false });
		await user.click(getByRole(dogsTreeItem, 'button', { name: 'More' }));
		const moveColOpt = await screen.findByRole('menuitem', { name: 'Move Collection' });
		await user.click(moveColOpt);

		const dialog = await screen.findByRole('dialog', { name: 'Select Collection' });
		const myLibrary = getByRole(dialog, 'treeitem', { name: 'My Library' });
		await user.click(getByRole(myLibrary, 'button', { name: 'Expand' }));

		// "Dogs" collection is disabled because it's the current collection
		expect(getByRole(dialog, 'treeitem', { name: 'Dogs' } )).toHaveAttribute('aria-disabled', 'true');

		const musicNode = getByRole(dialog, 'treeitem', { name: 'Algorithms' });
		await userEvent.click(musicNode);

		const moveBtn = getByRole(dialog, 'button', { name: 'Move' });
		expect(moveBtn).toBeEnabled();

		let hasBeenPatched = false;

		server.use(
			http.patch('https://api.zotero.org/users/1/collections/WTTJ2J56', async ({request}) => {
				const patch = await request.json();
				expect(patch.parentCollection).toBe('CSB4KZUU');
				hasBeenPatched = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		await userEvent.click(moveBtn);
		expect(hasBeenPatched).toBe(true);
	});

	test('Deleted collection does not appear in the tree', async () => {
		const modifiedState = getPatchedState(state, 'libraries.u1.dataObjects.SGQRGR2J', { deleted: 1 });
		renderWithProviders(<MainZotero />, { preloadedState: modifiedState });
		await waitForPosition();
		expect(screen.queryByRole('treeitem', { name: 'Board Games' })).not.toBeInTheDocument();
	});

	test("Non-deleted collection appears in the tree", async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		expect(screen.queryByRole('treeitem', { name: 'Board Games' })).toBeInTheDocument();
	});

	["Windows", "MacOS"].forEach((platform) => {
		test(`Should highlight collection in which the item is present on ${platform}`, async () => {
			let userAgent, key, wrongKey;
			switch (platform) {
				case "MacOS":
					userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0";
					key = "Alt";
					wrongKey = "Control";
					break;
				case "Windows":
					userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0";
					key = "Control";
					wrongKey = "Alt";
					break;
			}

			jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent);
			delete window.location;
			window.jsdom.reconfigure({ url: 'http://localhost/testuser/search/retriever/titleCreatorYear/items/KBFTPTI4/item-list' });;

			renderWithProviders(<MainZotero />, { preloadedState: stateSearch });
			await waitForPosition();
			const user = userEvent.setup();

			act(() => screen.getByRole('row',
				{ name: 'Retriever' }
			).focus());


			expect(screen.getByRole('treeitem', { name: 'Dogs', expanded: false })).toBeInTheDocument();

			await user.keyboard(`{${key}>}`);
			// Parent collection is automatically expanded
			expect(screen.getByRole('treeitem', { name: 'Dogs', expanded: true })).toBeInTheDocument();
			expect(screen.getByRole('treeitem', { name: 'Goldens' }).parentNode).toHaveClass('highlighted');
			await user.keyboard(`{/${key}}`);
			await user.keyboard(`{${wrongKey}>}`);
			expect(screen.getByRole('treeitem', { name: 'Goldens' }).parentNode).not.toHaveClass('highlighted');
			await user.keyboard(`{/${wrongKey}}`);
		});
	});

	test("Should not expand highlighted collection", async () => {
		jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0');
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		act(() => screen.getByRole('row',
			{ name: 'Effects of diet restriction on life span and age-related changes in dogs' }
		).focus()
		);

		await user.keyboard(`{Alt>}`);
		expect(screen.getByRole('treeitem', { name: 'Dogs', expanded: false })).toBeInTheDocument();
		expect(screen.getByRole('treeitem', { name: 'Dogs' }).parentNode).toHaveClass('highlighted');
		await user.keyboard(`{Alt>}`);
	});

});

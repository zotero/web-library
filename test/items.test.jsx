/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getAllByRole, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import zoteroFormattingCollectionStateRaw from './fixtures/state/test-user-formatting-collection.json';
import itemTypeFieldsBook from './fixtures/response/item-type-fields-book.json';
import itemTypeCreatorTypesBook from './fixtures/response/item-type-creator-types-book.json';
import responseAddItemToCollections from './fixtures/response/test-user-add-item-to-collection.json';
import newItemJournalArticle from './fixtures/response/new-item-journal-article.json';
import newItemNote from './fixtures/response/new-item-note.json';
import testUserAddNewItem from './fixtures/response/test-user-add-new-item.json';
import testUserRemoveItemFromCollection from './fixtures/response/test-user-remove-item-from-collection.json';
import testUserTrashItem from './fixtures/response/test-user-trash-item.json';
import searchByIdentifier from './fixtures/response/search-by-identifier.json';
import responseAddByIdentifier from './fixtures/response/test-user-add-by-identifier.json';
import testUserDuplicateItem from './fixtures/response/test-user-duplicate-item.json';

const state = JSONtoState(stateRaw);
const formattingState = JSONtoState(zoteroFormattingCollectionStateRaw);

describe('Test User\'s library', () => {
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
		window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Add new items using "plus" button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const plusBtn = screen.getByRole('button', { name: 'New Item' });
		await userEvent.click(plusBtn);
		await waitForPosition();

		// menu should be open
		expect(screen.getByRole('button',
			{ name: 'New Item', expanded: true })
		).toBeInTheDocument();

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('journalArticle');
				return res(res => {
					res.body = JSON.stringify(newItemJournalArticle);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].itemType).toEqual('journalArticle');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserAddNewItem);
					return res;
				});
			}),
		);

		const itemTypeOpt = screen.getByRole('menuitem', { name: 'Journal Article' });
		await userEvent.click(itemTypeOpt);
		await waitForPosition();

		// menu should be closed
		expect(screen.getByRole('button',
			{ name: 'New Item', expanded: false })
		).toBeInTheDocument();

		expect(hasBeenPosted).toBe(true);
	});

	test('Add new item using "Add By Identifier" button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const addBtn = screen.getByRole('button', { name: 'Add By Identifier' });
		await userEvent.click(addBtn);
		await waitForPosition();

		expect(screen.getByRole('dialog',
			{ name: 'Add By Identifier' })
		).toBeInTheDocument();

		let hasBeenSearched = false;
		let hasBeenCreated = false;

		server.use(
			rest.post('https://translate-server.zotero.org/Prod/search', async (req, res) => {
				const identifier = await req.text();
				expect(identifier).toEqual('0312558066');
				hasBeenSearched = true;
				return res(res => {
					res.body = JSON.stringify(searchByIdentifier);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('UHRGBS8D');
				expect(items[0].ISBN).toBe('9780312558062');
				expect(items[0].collections).toEqual(["WTTJ2J56"]);
				hasBeenCreated = true;
				return res(res => {
					res.body = JSON.stringify(responseAddByIdentifier);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemTypeCreatorTypes', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypeCreatorTypesBook);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemTypeFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypeFieldsBook);
					return res;
				});
			}),
		);

		const input = screen.getByRole('textbox',
			{ name: 'Enter a URL, ISBNs, DOIs, PMIDs, or arXiv IDs' }
		);

		await userEvent.type(
			input, '0312558066{enter}', { skipClick: true }
		);
		await waitForPosition();
		await screen.findByRole('row', { name: 'Hachiko waits' })

		expect(screen.queryByRole('dialog',
			{ name: 'Add By Identifier' }
		)).not.toBeInTheDocument();

		expect(hasBeenSearched).toBe(true);
		expect(hasBeenCreated).toBe(true);
	});

	test('Add item to a collection using modal', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const addToCollectionBtn = screen.getByRole('button',
			{ name: 'Add To Collection' }
		);

		await userEvent.click(addToCollectionBtn);

		const dialog = screen.getByRole('dialog', { name: 'Select Collection' });
		expect(dialog).toBeInTheDocument();

		expect(getByRole(dialog, 'button', { name: 'Close Dialog' })).toBeInTheDocument();

		const myLibraryNode = getByRole(dialog, 'treeitem', { name: 'My Library' });
		await userEvent.click(getByRole(myLibraryNode, 'button', { name: 'Expand' }));

		// "Dogs" collection is disabled because current item is already in it
		expect(getByRole(dialog, 'treeitem',
			{ name: 'Dogs', expanded: false }
		)).toHaveAttribute('aria-disabled', 'true');

		// Add button is disabled because no collection is selected yet
		expect(getByRole(dialog, 'button',
			{ name: 'Add' }
		)).toBeDisabled();

		const musicNode = getByRole(dialog, 'treeitem', { name: 'Music' });
		await userEvent.click(musicNode);

		const addBtn = getByRole(dialog, 'button',{ name: 'Add' });
		expect(addBtn).toBeEnabled();

		let hasBeenUpdated = false;

		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].collections).toEqual(["WTTJ2J56", "4VM2BFHN"]);

				hasBeenUpdated = true;
				return res(res => {
					res.body = JSON.stringify(responseAddItemToCollections);
					return res;
				});
			})
		);

		await userEvent.click(addBtn);
		expect(hasBeenUpdated).toBe(true);
	});

	test('Remove item from a colection using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return res(res => {
					res.body = JSON.stringify(newItemNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toEqual('VR82JUX8');
				expect(items[0].collections).toEqual([]);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserRemoveItemFromCollection);
					return res;
				});
			}),
		);

		const removeFromCollectionBtn = screen.getByRole('button',
			{ name: 'Remove From Collection' }
		);

		await userEvent.click(removeFromCollectionBtn);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(getAllByRole(gridBody, 'row')).toHaveLength(6));
	});

	test('Trash item using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return res(res => {
					res.body = JSON.stringify(newItemNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toEqual('VR82JUX8');
				expect(items[0].deleted).toEqual(1);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserTrashItem);
					return res;
				});
			}),
		);

		const trashBtn = screen.getByRole('button',
			{ name: 'Move To Trash' }
		);

		await userEvent.click(trashBtn);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(getAllByRole(gridBody, 'row')).toHaveLength(6));
	});

	test('Duplicate item using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		expect(screen.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' })).toBeInTheDocument();

		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });

		const moreBtn = getByRole(toolbar, 'button', { name: 'More' });
		await userEvent.click(moreBtn);
		await waitForPosition();

		// menu should be open
		expect(getByRole(toolbar, 'button',
			{ name: 'More', expanded: true })
		).toBeInTheDocument();

		let hasBeenPosted = false;

		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].title).toEqual('Effects of diet restriction on life span and age-related changes in dogs');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserDuplicateItem);
					return res;
				});
			})
		);

		const duplicateOpt = screen.getByRole('menuitem', { name: 'Duplicate Item' });

		await userEvent.click(duplicateOpt);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(screen.getAllByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' })).toHaveLength(2));
	});

	test('Renders formatted titles in the items list', async () => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/collections/5PB9WKTC/items/MNRM7HER/collection');
		renderWithProviders(<MainZotero />, { preloadedState: formattingState });
		await waitForPosition();
		expect(screen.getByRole('grid', { name: 'items' })).toBeInTheDocument();
		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');
		expect(getAllByRole(gridBody, 'row')).toHaveLength(9);

		const row1 = getByRole(gridBody, 'row', { name: 'has subscript and superscript' });
		expect(row1.innerHTML).toEqual(expect.stringContaining('has <sub>subscript</sub> and <sup>superscript</sup>'));

		const row2 = getByRole(gridBody, 'row', { name: 'has small-caps' });
		expect(row2.innerHTML).toEqual(expect.stringContaining('has <span style="font-variant: small-caps;">small-caps</span>'));

		const row3 = getByRole(gridBody, 'row', { name: 'has nocase span' });
		expect(row3.innerHTML).toEqual(expect.stringContaining('has <span>nocase</span> span'));

		const row4 = getByRole(gridBody, 'row', { name: 'has nested not bold' });
		expect(row4.innerHTML).toEqual(expect.stringContaining('<span>has <b>nested <b style="font-weight: normal;">not</b> bold</b></span>'));

		const row5 = getByRole(gridBody, 'row', { name: 'everything nested' });
		expect(row5.innerHTML).toEqual(expect.stringContaining('everything <i><b><sub><sup><span style="font-variant: small-caps;">nested</span></sup></sub></b></i>'));

		const row6 = getByRole(gridBody, 'row', { name: '<span class="test">random</span> class names not allowed' });
		expect(row6.innerHTML).toEqual(expect.stringContaining('&lt;span class="test"&gt;random&lt;/span&gt; class names not allowed'));

		const row7 = getByRole(gridBody, 'row', { name: '<button onclick="javascript:alert(\'hello\')">js</button> not allowed' });
		expect(row7.innerHTML).toEqual(expect.stringContaining('&lt;button onclick="javascript:alert(\'hello\')"&gt;js&lt;/button&gt; not allowed'));

		const row8 = getByRole(gridBody, 'row', { name: 'bold and italic' });
		expect(row8.innerHTML).toEqual(expect.stringContaining('<b>bold</b> and <i>italic</i>'));

		const row9 = getByRole(gridBody, 'row', { name: '<a href="http://zotero.org">links</a> not allowed' });
		expect(row9.innerHTML).toEqual(expect.stringContaining('&lt;a href="http://zotero.org"&gt;links&lt;/a&gt; <b>not</b> allowed'));
	});
});

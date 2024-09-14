/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getAllByRole, getByRole, getByText, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';
import stateLibraryView from './fixtures/state/desktop-test-user-library-view.json';
import zoteroFormattingCollectionStateRaw from './fixtures/state/desktop-test-user-formatting-collection.json';
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
import testUserSearchResults from './fixtures/response/test-user-search-results.json';
import testUserSearchResultsTags from './fixtures/response/test-user-search-results-tags.json';
import testUserItemsGolden from './fixtures/response/test-user-get-items-golden.json';
import testUserItemsGoldenTags from './fixtures/response/test-user-get-items-golden-tags.json';

const state = JSONtoState(stateRaw);
const libraryViewState = JSONtoState(stateLibraryView);
const formattingState = JSONtoState(zoteroFormattingCollectionStateRaw);

describe('Items', () => {
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
		window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details');
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
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				const itemKey = url.searchParams.get('itemType');
				expect(itemKey).toBe('journalArticle');
				return HttpResponse.json(newItemJournalArticle);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toEqual('journalArticle');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewItem);
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
			http.post('https://translate-server.zotero.org/Prod/search', async ({request}) => {
				const identifier = await request.text();
				expect(identifier).toEqual('0312558066');
				hasBeenSearched = true;
				return HttpResponse.json(searchByIdentifier);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].key).toBe('UHRGBS8D');
				expect(items[0].ISBN).toBe('9780312558062');
				expect(items[0].collections).toEqual(["WTTJ2J56"]);
				hasBeenCreated = true;
				return HttpResponse.json(responseAddByIdentifier);
			}),
			http.get('https://api.zotero.org/itemTypeCreatorTypes', () => {
				return HttpResponse.json(itemTypeCreatorTypesBook);
			}),
			http.get('https://api.zotero.org/itemTypeFields', () => {
				return HttpResponse.json(itemTypeFieldsBook);
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
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].collections).toEqual(["WTTJ2J56", "4VM2BFHN"]);

				hasBeenUpdated = true;
				return HttpResponse.json(responseAddItemToCollections);
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
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				const itemKey = url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return HttpResponse.json(newItemNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].key).toEqual('VR82JUX8');
				expect(items[0].collections).toEqual([]);
				hasBeenPosted = true;
				return HttpResponse.json(testUserRemoveItemFromCollection);
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
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				const itemKey = url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return HttpResponse.json(newItemNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].key).toEqual('VR82JUX8');
				expect(items[0].deleted).toEqual(1);
				hasBeenPosted = true;
				return HttpResponse.json(testUserTrashItem);
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
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].title).toEqual('Effects of diet restriction on life span and age-related changes in dogs');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return HttpResponse.json(testUserDuplicateItem);
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
		expect(getAllByRole(gridBody, 'row')).toHaveLength(10);

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

	test("Renders correctly ordered tag color swatches in the items list", async () => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/');
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		// derived data for current view is already present in fixture so we need to "fetch" different view to test this feature
		server.use(
			http.get('https://api.zotero.org/users/1/items/top/tags', () => {
				return HttpResponse.json(testUserSearchResultsTags, {
					headers: { 'Total-Results': testUserSearchResultsTags.length }
				});
			}),
			http.get('https://api.zotero.org/users/1/items/top', () => {
				return HttpResponse.json(testUserSearchResults, {
					headers: { 'Total-Results': testUserSearchResults.length }
				});
			})
		);

		const searchBox = screen.getByRole('searchbox', { name: 'Title, Creator, Year' });
		await user.type(searchBox, 'pathfinding');

		await waitFor(() => expect(searchBox).toHaveValue('pathfinding'));
		await waitFor(() => expect(screen.getByText('7 items in this view')).toBeInTheDocument());

		const row = screen.getByRole('row', { name: 'A*-based pathfinding in modern computer games' });
		const violetSwatch = getByRole(row, 'img', { name: 'violet circle icon' }); // position 1
		const greenSwatch = getByRole(row, 'img', { name: 'green circle icon' }); // position 2

		// https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition#node.document_position_following
		// otherNode follows the node, i.e. greenSwatch follows violetSwatch
		expect(violetSwatch.compareDocumentPosition(greenSwatch) & Node.DOCUMENT_POSITION_FOLLOWING).toBeGreaterThan(0);
	});

	test("Includes emoji from non-colored tags in the items list", async () => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/');
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		// derived data for current view is already present in fixture so we need to "fetch" different view to test this feature
		server.use(
			http.get('https://api.zotero.org/users/1/collections/9WZDZ7YA/items/top/tags', () => {
				return HttpResponse.json(testUserItemsGoldenTags, {
					headers: { 'Total-Results': testUserItemsGoldenTags.length }
				});
			}),
			http.get('https://api.zotero.org/users/1/collections/9WZDZ7YA/items/top', () => {
				return HttpResponse.json(testUserItemsGolden, {
					headers: { 'Total-Results': testUserItemsGolden.length }
				});
			})
		);

		await user.click(getByRole(screen.getByRole('treeitem', { name: 'Dogs' }), 'button', { name: 'Expand' }));
		await user.click(screen.getByRole('treeitem', { name: 'Goldens' }));

		await waitFor(() => expect(screen.getByText('5 items in this view')).toBeInTheDocument());

		const row = screen.getByRole('row', { name: 'Retriever' });
		expect(getByText(row, '🐕')).toBeInTheDocument();
	});
});

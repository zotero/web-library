import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { findAllByRole, getByRole, screen, queryByRole, waitFor, getAllByRole } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState, getPatchedState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateLibraryView from './fixtures/state/desktop-test-user-library-view.json';
import testUserSearchResults from './fixtures/response/test-user-search-results.json';
import testUserSearchResultsTags from './fixtures/response/test-user-search-results-tags.json';
import collectionItems from './fixtures/response/test-user-collection-items.json';
import collectionTags from './fixtures/response/test-user-collection-items-tags.json';
import searchByTagResults from './fixtures/response/test-user-search-by-tag-results.json';
import searchByTagResultsTags from './fixtures/response/test-user-search-by-tag-results-tags.json';
import tagsSecondPage from './fixtures/response/zotero-user-tags-second-page.json';

const libraryViewState = JSONtoState(stateLibraryView);
applyAdditionalJestTweaks();

describe('Basic UI', () => {
	const handlers = [];
	const server = setupServer(...handlers)

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
		window.location = new URL('http://localhost/');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Shows all UI elements', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();
		expect(screen.queryByRole('img', { name: 'Loading' })).not.toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Zotero' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Zotero' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('navigation', { name: 'Site navigation' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Zotero User', expanded: false })).toBeInTheDocument();

		expect(screen.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Search Mode', expanded: false })).toBeInTheDocument();

		expect(screen.getByRole('navigation', { name: 'collection tree' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Collapse Tag Selector' })).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: 'tag selector' })).toBeInTheDocument();
		expect(screen.getByRole('searchbox', { name: 'Filter Tags' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Tag Selector Options' })).toBeInTheDocument();
		expect(screen.getByRole('toolbar', { name: 'items toolbar' })).toBeInTheDocument();
		expect(screen.getByRole('grid', { name: 'items' })).toBeInTheDocument();
		expect(screen.getByText('82 items in this view')).toBeInTheDocument();
	});


	test('Entering text into search box runs search, clearing it clears search', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		server.use(
			http.get('https://api.zotero.org/users/1/items/top', () => {
				return HttpResponse.json(testUserSearchResults, {
					headers: { 'Total-Results': testUserSearchResults.length }
				});
			}),
			http.get('https://api.zotero.org/users/1/items/top/tags', () => {
				return HttpResponse.json(testUserSearchResultsTags, {
					headers: { 'Total-Results': testUserSearchResultsTags.length }
				});
			}),
		);

		expect(screen.queryByRole('button', { name: 'Clear Search' })).not.toBeInTheDocument();
		const searchBox = screen.getByRole('searchbox', { name: 'Title, Creator, Year' });

		await user.type(searchBox, 'pathfinding');
		await waitFor(() => expect(searchBox).toHaveValue('pathfinding'));
		await screen.findByText('7 items in this view', {}, { timeout: 5000 });
		expect(await screen.findByRole('row', { name: 'Summary of pathfinding algorithms used in game development' })).toBeInTheDocument();
		expect(screen.queryByRole('row', { name: 'Border Collie' })).not.toBeInTheDocument();

		const clearSearchButton = await screen.findByRole('button', { name: 'Clear Search' });
		expect(clearSearchButton).toBeInTheDocument();
		await user.click(clearSearchButton);

		await waitFor(() => expect(searchBox).toHaveValue(''));
		await waitFor(() => expect(screen.getByText('82 items in this view')).toBeInTheDocument());
		expect(await screen.findByRole('row', { name: 'Border Collie' })).toBeInTheDocument();
		expect(screen.queryByRole('row', { name: 'Summary of pathfinding algorithms used in game development' })).not.toBeInTheDocument();
	});

	test('Navigating to a collection', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		server.use(
			http.get('https://api.zotero.org/users/1/collections/4VM2BFHN/items/top', () => {
				return HttpResponse.json(collectionItems, {
					headers: { 'Total-Results': collectionItems.length }
				});
			}),
			http.get('https://api.zotero.org/users/1/collections/4VM2BFHN/items/top/tags', () => {
				return HttpResponse.json(collectionTags, {
					headers: { 'Total-Results': collectionTags.length }
				});
			}),
		);

		expect(screen.getByRole('treeitem',
			{ name: 'My Library', selected: true })
		).toBeInTheDocument();

		const collectionItem = screen.getByRole('treeitem', { name: 'Music', selected: false });
		await userEvent.click(collectionItem);
		await waitForPosition();

		expect(screen.getByRole('treeitem',
			{ name: 'Music', selected: true })
		).toBeInTheDocument();

		expect(screen.queryByRole('treeitem',
			{ name: 'My Library', selected: true })
		).not.toBeInTheDocument();

		expect(screen.queryByRole('treeitem',
			{ name: 'My Library', selected: false })
		).toBeInTheDocument();

		expect(screen.getByRole('row',
			{ name: 'Connecting Music to Ethics' })
		).toBeInTheDocument();

		expect(screen.queryByRole('row',
			{ name: 'A systematic literature review of A* pathfinding' })
		).not.toBeInTheDocument();

		expect(screen.getByText('10 items in this view')).toBeInTheDocument();
	});

	test('Filtering tags', async () => {
		let hasRequestedSecondPage = false;
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, {
			preloadedState: getPatchedState(libraryViewState, 'libraries.u1.tagsTop', {
				totalResults: libraryViewState.libraries.u1.tagsTop.totalResults + tagsSecondPage.length,
				pointer: libraryViewState.libraries.u1.tagsTop.tags.length
			})
		});
		await waitForPosition();


		server.use(
			http.get('https://api.zotero.org/users/1/items/top/tags', () => {
				hasRequestedSecondPage = true;
				return HttpResponse.json(tagsSecondPage, {
					headers: { 'Total-Results': tagsSecondPage.length }
				});
			}),
		);

		const filterTagsInput = screen.getByRole('searchbox', { name: 'Filter Tags' });

		await user.type(filterTagsInput, 'Film');

		const tagSelector = await screen.findByRole('navigation', { name: 'tag selector' });
		const tagButtons = (await findAllByRole(tagSelector, 'button'))
			.filter(tb => tb.getAttribute('title') !== 'Collapse Tag Selector')
			.filter(tb => tb.getAttribute('title') !== 'Tag Selector Options');

		await waitFor(() => expect(tagButtons).toHaveLength(3));
		expect(hasRequestedSecondPage).toBe(true);
	});

	test('Filtering items by tag', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		server.use(
			http.get('https://api.zotero.org/users/1/items/top', () => {
				return HttpResponse.json(searchByTagResults, {
					headers: { 'Total-Results': searchByTagResults.length }
				});
			}),
			http.get('https://api.zotero.org/users/1/items/top/tags', () => {
				return HttpResponse.json(searchByTagResultsTags, {
					headers: { 'Total-Results': searchByTagResultsTags.length }
				});
			})
		);

		const tagSelector = screen.getByRole('navigation', { name: 'tag selector' });
		const tagButton = getByRole(tagSelector, 'button', { name: 'to read', pressed: false });

		expect(screen.getByText('82 items in this view')).toBeInTheDocument();

		await userEvent.click(tagButton);
		await waitForPosition();

		expect(screen.getByRole('row',
			{ name: 'A systematic literature review of A* pathfinding' })
		).toBeInTheDocument();

		expect(getByRole(tagSelector, 'button',
			{ name: 'to read', pressed: true })
		).toBeInTheDocument();

		expect(getByRole(tagSelector, 'button',
			{ name: 'coding', pressed: false })
		).toBeInTheDocument();

		expect(screen.getByText('7 items in this view')).toBeInTheDocument();
	});

	test('Selecting item', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		expect(screen.getByText('82 items in this view')).toBeInTheDocument();
		expect(screen.queryByRole('tablist', { name: 'Item Details' })).not.toBeInTheDocument();

		const item = screen.getByRole('row',
			{ name: 'A comparison of sequential Delaunay triangulation algorithms' });

		await userEvent.click(item);
		await waitForPosition();

		expect(screen.getByRole('row',
			{ name: 'A comparison of sequential Delaunay triangulation algorithms' })
		).toHaveAttribute('aria-selected', 'true');

		expect(screen.queryByRole('82 items in this view')).not.toBeInTheDocument();
		expect(screen.getByRole('tablist', { name: 'Item Details' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Info', selected: true })).toBeInTheDocument();
	});

	test('Configuring columns', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const columnSelectorBtn = screen.getByRole('button',
			{ name: 'Column Selector', expanded: false }
		);

		expect(getByRole(grid, 'columnheader', { name: 'Creator' })).toBeInTheDocument();
		expect(queryByRole(grid, 'columnheader', { name: 'Item Type' })).not.toBeInTheDocument();

		await userEvent.click(columnSelectorBtn);
		await waitForPosition();

		// dropdown should be open
		expect(screen.getByRole('button',
			{ name: 'Column Selector', expanded: true })
		).toBeInTheDocument();

		// creator column is ON by default so it should be checked
		const columnSelector = screen.getByRole('menu', { name: 'Column Selector' });
		expect(getByRole(columnSelector, 'menuitemcheckbox',
			{ name: 'Creator', checked: true })
		).toBeInTheDocument();

		// item type column is OFF by default, click it to turn it ON
		const itemTypeBtn = getByRole(columnSelector, 'menuitemcheckbox',
			{ name: 'Item Type', checked: false }
		);
		await userEvent.click(itemTypeBtn);
		await waitForPosition();

		// new column should be added, dropdown should be closed
		expect(getByRole(grid, 'columnheader', { name: 'Creator' })).toBeInTheDocument();
		expect(getByRole(grid, 'columnheader', { name: 'Item Type' })).toBeInTheDocument();
		await waitFor(
			() => expect(screen.getByRole('button', { name: 'Column Selector', expanded: false })).toBeInTheDocument()
		);

		// Open dropdown again, open "more"	menu
		await userEvent.click(columnSelectorBtn);
		await waitForPosition();

		// Option to enable "language" column is hidden behind "more" menu option
		expect(queryByRole(columnSelector, 'menuitemcheckbox',
			{ name: 'Language', checked: false })
		).not.toBeInTheDocument();

		const moreBtn = getByRole(columnSelector, 'menuitem',
			{ name: 'More' }
		);

		await userEvent.click(moreBtn);
		await waitForPosition();

		// dropdown should stay open, more options, including "language", should appear
		expect(screen.getByRole('button',
			{ name: 'Column Selector', expanded: true })
		).toBeInTheDocument();
		expect(getByRole(columnSelector, 'menuitemcheckbox',
			{ name: 'Language', checked: false })
		).toBeInTheDocument();

		// disable "creator" column
		const creatorBtn = getByRole(columnSelector, 'menuitemcheckbox',
			{ name: 'Creator', checked: true }
		);

		await userEvent.click(creatorBtn);
		await waitForPosition();

		expect(queryByRole(grid, 'columnheader', { name: 'Creator' })).not.toBeInTheDocument();
	});

	test('New item dropdown includes sorted primary and secondary options', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await waitForPosition();

		const plusBtn = screen.getByRole('button', { name: 'New Item' });
		await userEvent.click(plusBtn);
		await waitForPosition();

		expect(screen.getByRole('button',{ name: 'New Item', expanded: true })).toBeInTheDocument();
		const itemTypePicker = screen.getByRole('menu', { name: 'New Item Type Picker' });
		const bookTypeBtn = getByRole(itemTypePicker, 'menuitem', { name: 'Book' });
		const journalTypeBtn = getByRole(itemTypePicker, 'menuitem', { name: 'Journal Article' });
		expect(bookTypeBtn).toBeInTheDocument();
		expect(journalTypeBtn).toBeInTheDocument();
		expect(bookTypeBtn.compareDocumentPosition(journalTypeBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

		expect(queryByRole(itemTypePicker, 'menuitem', { name: 'Artwork' })).not.toBeInTheDocument();
		expect(queryByRole(itemTypePicker, 'menuitem', { name: 'Patent' })).not.toBeInTheDocument();
		expect(queryByRole(itemTypePicker, 'menuitem', { name: 'Software' })).not.toBeInTheDocument();

		await userEvent.click(getByRole(itemTypePicker, 'menuitem', { name: 'More' }));
		await waitForPosition();

		const artworkTypeBtn = getByRole(itemTypePicker, 'menuitem', { name: 'Artwork' });
		const patentTypeBtn = getByRole(itemTypePicker, 'menuitem', { name: 'Patent' });
		const softwareTypeBtn = getByRole(itemTypePicker, 'menuitem', { name: 'Software' });
		expect(artworkTypeBtn).toBeInTheDocument();
		expect(patentTypeBtn).toBeInTheDocument();
		expect(softwareTypeBtn).toBeInTheDocument();
		// ignored item types must not be shown
		expect(queryByRole(itemTypePicker, 'menuitem', { name: 'Attachment' })).not.toBeInTheDocument();
		expect(queryByRole(itemTypePicker, 'menuitem', { name: 'attachment' })).not.toBeInTheDocument();
		expect(queryByRole(itemTypePicker, 'menuitem', { name: 'note' })).not.toBeInTheDocument();

		// primary options must not be repeated
		expect(getAllByRole(itemTypePicker, 'menuitem', { name: 'Book' })).toHaveLength(1);

		// options must be sorted by the localized name (software) not the itemType (computerProgram)
		expect(artworkTypeBtn.compareDocumentPosition(patentTypeBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
		expect(patentTypeBtn.compareDocumentPosition(softwareTypeBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
	});
});

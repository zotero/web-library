import '@testing-library/jest-dom'
import { rest, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { findAllByRole, getByRole, screen, queryByRole, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import zoteroUserStateRaw from './fixtures/state/zotero-user.json';
import itemTypes from './fixtures/response/item-types';
import itemFields from './fixtures/response/item-fields';
import searchResults from './fixtures/response/zotero-user-search-results.json';
import searchResultsTags from './fixtures/response/zotero-user-search-results-tags.json';
import collectionItems from './fixtures/response/zotero-user-collection-items.json';
import collectionTags from './fixtures/response/zotero-user-collection-tags.json';
import tagResults from './fixtures/response/zotero-user-tag-results.json';
import tagResultsTags from './fixtures/response/zotero-user-tag-results-tags.json';
import itemTypeFieldsFilm from './fixtures/response/item-type-fields-film.json';
import itemTypeCreatorTypesFilm from './fixtures/response/item-type-creator-types-film.json';


const zoteroUserState = JSONtoState(zoteroUserStateRaw);
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
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
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
		expect(screen.getByText('164 items in this view')).toBeInTheDocument();
	});


	test('Entering text into search box runs search, clearing it clears search', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/475425/items/top/tags', () => {
				return HttpResponse.json(searchResultsTags, {
					headers: { 'Total-Results': '1' }
				});
			}),
			rest.get('https://api.zotero.org/users/475425/items/top', () => {
				return HttpResponse.json(searchResults, {
					headers: { 'Total-Results': '15' }
				});
			})
		);

		expect(screen.queryByRole('button', { name: 'Clear Search' })).not.toBeInTheDocument();
		const searchBox = screen.getByRole('searchbox', { name: 'Title, Creator, Year' });

		await user.type(searchBox, 'Zotero');

		await waitFor(() => expect(searchBox).toHaveValue('Zotero'));
		await waitFor(() => expect(screen.getByText('15 items in this view')).toBeInTheDocument());
		expect(await screen.findByRole('row', { name: 'Zotero | Home' })).toBeInTheDocument();


		const clearSearchButton = await screen.findByRole('button', { name: 'Clear Search' });
		expect(clearSearchButton).toBeInTheDocument();
		await user.click(clearSearchButton);

		await waitFor(() => expect(searchBox).toHaveValue(''));
		await waitFor(() => expect(screen.getByText('164 items in this view')).toBeInTheDocument());
		expect(await screen.findByRole('row',
			{ name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' })
		).toBeInTheDocument();
		expect(screen.queryByRole('row', { name: 'Zotero | Home' })).not.toBeInTheDocument();
	});

	test('Navigating to a collection', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/475425/collections/9MK5KS97/items/top', () => {
				return HttpResponse.json(collectionItems, {
					headers: { 'Total-Results': '12' }
				});
			}),
			rest.get('https://api.zotero.org/users/475425/collections/9MK5KS97/items/top/tags', () => {
				return HttpResponse.json(collectionTags, {
					headers: { 'Total-Results': '6' }
				});
			}),
		);

		expect(screen.getByRole('treeitem',
			{ name: 'My Library', selected: true })
		).toBeInTheDocument();

		const collectionItem = screen.getByRole('treeitem', { name: 'Humanities', selected: false });
		await userEvent.click(collectionItem);
		await waitForPosition();

		expect(screen.getByRole('treeitem',
			{ name: 'Humanities', selected: true })
		).toBeInTheDocument();

		expect(screen.queryByRole('treeitem',
			{ name: 'My Library', selected: true })
		).not.toBeInTheDocument();

		expect(screen.queryByRole('treeitem',
			{ name: 'My Library', selected: false })
		).toBeInTheDocument();

		expect(screen.getByRole('row',
			{ name: 'Lady Hester Lucy Stanhope: a new light on her life and love affairs.' })
		).toBeInTheDocument();

		expect(screen.queryByRole('row',
			{ name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' })
		).not.toBeInTheDocument();

		expect(screen.getByText('12 items in this view')).toBeInTheDocument();
	});

	test('Filtering tags', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		const filterTagsInput = screen.getByRole('searchbox', { name: 'Filter Tags' });

		await user.type(filterTagsInput, 'Film');

		const tagSelector = await screen.findByRole('navigation', { name: 'tag selector' });
		const tagButtons = (await findAllByRole(tagSelector, 'button'))
			.filter(tb => tb.getAttribute('title') !== 'Collapse Tag Selector')
			.filter(tb => tb.getAttribute('title') !== 'Tag Selector Options');

		expect(tagButtons).toHaveLength(8);
	});

	test('Filtering items by tag', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/475425/items/top', () => {
				return HttpResponse.json(tagResults, {
					headers: { 'Total-Results': '1' }
				});
			}),
			rest.get('https://api.zotero.org/users/475425/items/top/tags', () => {
				return HttpResponse.json(tagResultsTags, {
					headers: { 'Total-Results': '7' }
				});
			})
		);

		const tagSelector = screen.getByRole('navigation', { name: 'tag selector' });
		const tagButton = getByRole(tagSelector, 'button', { name: 'Adventure films', pressed: false });

		expect(screen.getByText('164 items in this view')).toBeInTheDocument();

		await userEvent.click(tagButton);
		await waitForPosition();

		expect(screen.getByRole('row',
			{ name: 'Indiana Jones and the Temple of Doom' })
		).toBeInTheDocument();

		expect(getByRole(tagSelector, 'button',
			{ name: 'Adventure films', pressed: true })
		).toBeInTheDocument();

		expect(getByRole(tagSelector, 'button',
			{ name: 'Fantasy films', pressed: false })
		).toBeInTheDocument();

		expect(screen.getByText('1 item in this view')).toBeInTheDocument();
	});

	test('Selecting item', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/itemTypes', () => {
				return HttpResponse.json(itemTypes);
			}),
			rest.get('https://api.zotero.org/itemFields', () => {
				return HttpResponse.json(itemFields);
			}),
			rest.get('https://api.zotero.org/creatorFields', () => {
				return HttpResponse.json(itemFields);
			}),
			rest.get('https://api.zotero.org/itemTypeCreatorTypes', () => {
				return HttpResponse.json(itemTypeCreatorTypesFilm);
			}),
			rest.get('https://api.zotero.org/itemTypeFields', () => {
				return HttpResponse.json(itemTypeFieldsFilm);
			}),
		);

		expect(screen.getByText('164 items in this view')).toBeInTheDocument();
		expect(screen.queryByRole('tablist', { name: 'Item Details' })).not.toBeInTheDocument();

		const item = screen.getByRole('row',
			{ name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' });

		await userEvent.click(item);
		await waitForPosition();

		expect(screen.getByRole('row',
			{ name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' })
		).toHaveAttribute('aria-selected', 'true');

		expect(screen.queryByRole('164 items in this view')).not.toBeInTheDocument();
		expect(screen.getByRole('tablist', { name: 'Item Details' })).toBeInTheDocument();
		expect(screen.getByRole('tab', { name: 'Info', selected: true })).toBeInTheDocument();
	});

	test('Configuring columns', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
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
});

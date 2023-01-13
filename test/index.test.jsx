import React from 'react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { act, getByRole, getAllByRole, screen, queryByRole, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import minState from './fixtures/state/minimal.json';
import zoteroUserStateRaw from './fixtures/state/zotero-user.json';
import itemTypes from './fixtures/response/item-types';
import itemFields from './fixtures/response/item-fields';
import creatorFields from './fixtures/response/creator-fields';
import searchResults from './fixtures/response/zotero-user-search-results.json';
import searchResultsTags from './fixtures/response/zotero-user-search-results-tags.json';
import collectionItems from './fixtures/response/zotero-user-collection-items.json';
import collectionTags from './fixtures/response/zotero-user-collection-tags.json';
import tagResults from './fixtures/response/zotero-user-tag-results.json';
import tagResultsTags from './fixtures/response/zotero-user-tag-results-tags.json';
import itemTypeFieldsFilm from './fixtures/response/item-type-fields-film.json';
import itemTypeCreatorTypesFilm from './fixtures/response/item-type-creator-types-film.json';


const zoteroUserState = JSONtoState(zoteroUserStateRaw);

jest.setTimeout(10000);

// disable streaming client
jest.mock('../src/js/component/zotero-streaming-client', () => () => null);

// mock auto-sizer (https://github.com/bvaughn/react-window/issues/454)
jest.mock('react-virtualized-auto-sizer', () => ({ children }) => children({ height: 600, width: 640 }));

Element.prototype.scrollIntoView = jest.fn();

// dropdowns and such update positions asynchronously trigger 'act' warning
// this is a workaround to silence the warning (https://floating-ui.com/docs/react#testing)
const waitForPosition = () => act(async () => { });


const actWithFakeTimers = async actCallback => {
	const user = userEvent.setup({ advanceTimers: () => jest.runAllTimers() });
	jest.useFakeTimers();
	await actCallback(user);
	act(() => jest.runOnlyPendingTimers());
	jest.useRealTimers();
}

const resizeWindow = (x, y) => {
	window.innerWidth = x;
	window.innerHeight = y;
	window.dispatchEvent(new Event('resize'));
}

describe('Loading Screen', () => {
	const handlers = [
		rest.get('https://api.zotero.org/itemTypes', (req, res, ctx) => {
			return res(ctx.json(itemTypes));
		}),
		rest.get('https://api.zotero.org/itemFields', (req, res, ctx) => {
			return res(ctx.json(itemFields));
		}),
		rest.get('https://api.zotero.org/creatorFields', (req, res, ctx) => {
			return res(ctx.json(creatorFields));
		}),
		rest.get('https://api.zotero.org/users/475425/settings', (req, res, ctx) => {
			return res(ctx.json({}));
		}),
		rest.get('https://api.zotero.org/users/475425/collections', (req, res) => {
			return res((res) => {
				res.headers.set('Total-Results', 5142);
				res.body = JSON.stringify([]);
				// first request (`start` is null or 0) is immediate,
				// subsequent requests are delayed so we get a spinner
				res.delay = req.url.searchParams.get('start') ? 100 : 0;
				return res;
			});
		}),
	];

	const server = setupServer(...handlers)

	beforeAll(() => {
		server.listen({
			onUnhandledRequest: 'error',
		});
	});

	beforeEach(() => {
		delete window.location;
		window.location = new URL('http://localhost/');
	});

	afterEach(() => server.resetHandlers());

	afterAll(() => server.close());

	test('Shows Z while fetching data', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
	});

	test('Shows spinner if large number of collections is detected', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
		expect(screen.getByRole('progressbar')).toBeInTheDocument();
	});
});

describe('Zotero User\'s read-only library', () => {
	const handlers = [];

	const server = setupServer(...handlers)

	beforeAll(() => {
		server.listen({
			onUnhandledRequest: 'error',
		});
		resizeWindow(1280, 720);
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
		expect(screen.getByRole('button', { name: 'collapse tag selector' })).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: 'tag selector' })).toBeInTheDocument();
		expect(screen.getByRole('searchbox', { name: 'Filter Tags' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Tag Selector Options' })).toBeInTheDocument();
		expect(screen.getByRole('toolbar', { name: 'items toolbar' })).toBeInTheDocument();
		expect(screen.getByRole('grid', { name: 'items' })).toBeInTheDocument();
		expect(screen.getByText('164 items in this view')).toBeInTheDocument();
	});

	test('Entering text into search box runs search, clearing it clears search', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/475425/items/top/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 1);
					res.body = JSON.stringify(searchResultsTags);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/users/475425/items/top', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 15);
					res.body = JSON.stringify(searchResults);
					return res;
				});
			})
		);

		expect(screen.queryByRole('button', { name: 'Clear Search' })).not.toBeInTheDocument();
		const searchBox = screen.getByRole('searchbox', { name: 'Title, Creator, Year' });

		await actWithFakeTimers(user => user.type(searchBox, 'Zotero'));
		await waitForPosition();

		const clearSearchButton = screen.getByRole('button', { name: 'Clear Search' });
		const tagSelector = screen.getByRole('navigation', { name: 'tag selector' });

		expect(searchBox).toHaveValue('Zotero');
		expect(clearSearchButton).toBeInTheDocument();

		expect(screen.getByText('15 items in this view')).toBeInTheDocument();
		expect(getByRole(tagSelector, 'button', { name: 'Zotero API' })).toBeInTheDocument();
		expect(screen.getByRole('row', { name: 'Zotero | Home' })).toBeInTheDocument();

		await actWithFakeTimers(user => user.click(clearSearchButton));
		await waitForPosition();

		expect(searchBox).toHaveValue('');

		expect(screen.getByRole('row',
			{ name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' })
		).toBeInTheDocument();

		expect(screen.queryByRole('row',
			{ name: 'Zotero | Home' })
		).not.toBeInTheDocument();
	});

	test('Navigating to a collection', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/475425/collections/9MK5KS97/items/top', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 12);
					res.body = JSON.stringify(collectionItems);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/users/475425/collections/9MK5KS97/items/top/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 6);
					res.body = JSON.stringify(collectionTags);
					return res;
				});
			}),
		);

		expect(screen.getByRole('treeitem',
			{ name: 'My Library', selected: true })
		).toBeInTheDocument();

		const collectionItem = screen.getByRole('treeitem',{ name: 'Humanities', selected: false });
		await actWithFakeTimers(user => user.click(collectionItem));
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
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		const filterTagsInput = screen.getByRole('searchbox', { name: 'Filter Tags' });

		await actWithFakeTimers(user => user.type(filterTagsInput, 'Film'));
		await waitForPosition();

		const tagSelector = screen.getByRole('navigation', { name: 'tag selector' });
		const tagButtons = getAllByRole(tagSelector, 'button')
			.filter(tb => tb.getAttribute('aria-label') !== 'collapse tag selector')
			.filter(tb => tb.getAttribute('title') !== 'Tag Selector Options');

		expect(tagButtons).toHaveLength(8);
	});

	test('Filtering items by tag', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: zoteroUserState });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/475425/items/top', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 1);
					res.body = JSON.stringify(tagResults);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/users/475425/items/top/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 7);
					res.body = JSON.stringify(tagResultsTags);
					return res;
				});
			})
		);

		const tagSelector = screen.getByRole('navigation', { name: 'tag selector' });
		const tagButton = getByRole(tagSelector, 'button', { name: 'Adventure films', pressed: false });

		expect(screen.getByText('164 items in this view')).toBeInTheDocument();

		await actWithFakeTimers(user => user.click(tagButton));
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
			rest.get('https://api.zotero.org/itemTypes', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypes);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemFields);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/creatorFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemFields);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemTypeCreatorTypes', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypeCreatorTypesFilm);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemTypeFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypeFieldsFilm);
					return res;
				});
			}),
		);

		expect(screen.getByText('164 items in this view')).toBeInTheDocument();
		expect(screen.queryByRole('tablist', { name: 'Item Details' })).not.toBeInTheDocument();

		const item = screen.getByRole('row',
			{ name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' });

		await actWithFakeTimers(user => user.click(item));
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

		await actWithFakeTimers(user => user.click(columnSelectorBtn));
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
		await actWithFakeTimers(user => user.click(itemTypeBtn));
		await waitForPosition();

		// new column should be added, dropdown should be closed
		expect(getByRole(grid, 'columnheader', { name: 'Creator' })).toBeInTheDocument();
		expect(getByRole(grid, 'columnheader', { name: 'Item Type' })).toBeInTheDocument();
		expect(screen.getByRole('button',
			{ name: 'Column Selector', expanded: false })
		).toBeInTheDocument();

		// Open dropdown again, open "more"	menu
		await actWithFakeTimers(user => user.click(columnSelectorBtn));
		await waitForPosition();

		// Option to enable "language" column is hidden behind "more" menu option
		expect(queryByRole(columnSelector, 'menuitemcheckbox',
			{ name: 'Language', checked: false })
		).not.toBeInTheDocument();

		const moreBtn = getByRole(columnSelector, 'menuitem',
			{ name: 'More' }
		);

		await actWithFakeTimers(user => user.click(moreBtn));
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

		await actWithFakeTimers(user => user.click(creatorBtn));
		await waitForPosition();

		expect(queryByRole(grid, 'columnheader', { name: 'Creator' })).not.toBeInTheDocument();
	});
});

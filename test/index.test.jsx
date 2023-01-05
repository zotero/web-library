import React from 'react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { act, getByRole, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render'
import { JSONtoState } from './utils/state'
import { MainZotero } from '../src/js/component/main'
import itemTypes from './fixtures/item-types';
import itemFields from './fixtures/item-fields';
import creatorFields from './fixtures/creator-fields';
import minState from './fixtures/state/minimal.json';
import zoteroUserStateRaw from './fixtures/state/zotero-user.json';
import searchResults from './fixtures/zotero-user-search-results.json';
import searchResultsTags from './fixtures/zotero-user-search-results-tags.json';

const zoteroUserState = JSONtoState(zoteroUserStateRaw);

// disable streaming client
jest.mock('../src/js/component/zotero-streaming-client', () => () => null);

// mock auto-sizer (https://github.com/bvaughn/react-window/issues/454)
jest.mock('react-virtualized-auto-sizer', () => ({ children }) => children({ height: 600, width: 640 }));

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

		await waitFor(() =>
			screen.getByRole('row', { name: 'Acute Phase T Cell Help in Neutrophil-Mediated Clearance of Helicobacter Pylori' })
		);

		expect(screen.queryByRole('row', { name: 'Zotero | Home' })).not.toBeInTheDocument();
	});
});

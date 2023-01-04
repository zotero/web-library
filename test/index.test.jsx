import React from 'react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { act, screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from './utils/render'
import { MainZotero } from '../src/js/component/main'
import itemTypes from './fixtures/item-types';
import itemFields from './fixtures/item-fields';
import creatorFields from './fixtures/creator-fields';
import minState from './fixtures/state/minimal.json';
import state from './fixtures/state/zotero-user.json';

// disable streaming client
jest.mock('../src/js/component/zotero-streaming-client', () => () => null);

// mock auto-sizer (https://github.com/bvaughn/react-window/issues/454)
jest.mock('react-virtualized-auto-sizer', () => ({ children }) => children({ height: 600, width: 640 }));

// dropdowns and such update positions asynchronously trigger 'act' warning
// this is a workaround to silence the warning (https://floating-ui.com/docs/react#testing)
const waitForPosition = () => act(async () => { });

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
			if (!req.url.searchParams.get('start')) {
				console.log('collections start 0', req.method, req.url.href);
			}
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
		renderWithProviders(<MainZotero />, { preloadedState: state });
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
});

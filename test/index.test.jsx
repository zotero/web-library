import React from 'react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { act, screen } from '@testing-library/react'

import { renderWithProviders } from './utils/render'
import { MainZotero } from '../src/js/component/main'
import itemTypes from './fixtures/item-types';
import itemFields from './fixtures/item-fields';
import creatorFields from './fixtures/creator-fields';
import minState from './fixtures/state/minimal.json';
import state from './fixtures/state/zotero-user.json';

// disable streaming client
jest.mock('../src/js/component/zotero-streaming-client', () => () => null);

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
		rest.get('https://api.zotero.org/users/475425/collections', (req, res, ctx) => {
			return res(ctx.json([]));
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

	test('Shows spinner while fetching data', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
	});
});

describe('Main screen', () => {
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
		expect(screen.getByRole('searchbox', { name: 'Title, Creator, Year' })).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: 'collection tree' })).toBeInTheDocument();
		expect(screen.getByRole('navigation', { name: 'tag selector' })).toBeInTheDocument();
		expect(screen.getByRole('searchbox', { name: 'Filter Tags' })).toBeInTheDocument();
		expect(screen.getByRole('toolbar', { name: 'items toolbar' })).toBeInTheDocument();
		// expect(screen.getByRole('grid', { name: 'items' })).toBeInTheDocument();
		expect(screen.getByText('164 items in this view')).toBeInTheDocument();
	});
});

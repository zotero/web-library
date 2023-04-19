import React from 'react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';
import schema from './fixtures/response/schema';

applyAdditionalJestTweaks();

describe('Loading Screen', () => {
	let schemaRequested = false;
	let settingsRequested = false;
	let collectionsRequestCounter = 0;
	const handlers = [
		rest.get('https://api.zotero.org/schema', (req, res, ctx) => {
			schemaRequested = true;
			return res(ctx.json(schema));
		}),
		rest.get('https://api.zotero.org/users/475425/settings', (req, res, ctx) => {
			settingsRequested = true;
			return res(ctx.json({}));
		}),
		rest.get('https://api.zotero.org/users/475425/collections', (req, res) => {
			return res((res) => {
				res.headers.set('Total-Results', 5142);
				res.body = JSON.stringify([]);
				// first request (`start` is null or 0) is immediate,
				// subsequent requests are delayed so we get a spinner
				res.delay = req.url.searchParams.get('start') ? 100 : 0;
				collectionsRequestCounter++;
				return res;
			});
		}),
		rest.get('https://api.zotero.org/users/475425/items/top', (req, res) => {
			return res(res => {
				res.headers.set('Total-Results', 0);
				res.body = JSON.stringify([]);
				return res;
			});
		}),
		rest.get('https://api.zotero.org/users/475425/items/top/tags', (req, res) => {
			return res(res => {
				res.headers.set('Total-Results', 0);
				res.body = JSON.stringify([]);
				return res;
			});
		}),
	];

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
		schemaRequested = false;
		settingsRequested = false;
		collectionsRequestCounter = 0;
	});

	afterEach(() => server.resetHandlers());

	afterAll(() => server.close());

	test('Shows Z while fetching data', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(schemaRequested).toBe(true));
		await waitFor(() => expect(settingsRequested).toBe(true));
	});

	test('Shows spinner if large number of collections is detected', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(screen.getByRole('progressbar')).toBeInTheDocument());
		expect(screen.getByRole('progressbar')).toBeInTheDocument();
		// we report 5142 collections, that's 52 requests, 100 items per request
		await waitFor(() => expect(collectionsRequestCounter).toBe(52));
	});
});

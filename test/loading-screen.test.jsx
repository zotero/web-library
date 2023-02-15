import React from 'react'
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';
import itemTypes from './fixtures/response/item-types';
import itemFields from './fixtures/response/item-fields';
import creatorFields from './fixtures/response/creator-fields';

applyAdditionalJestTweaks();

describe('Loading Screen', () => {
	let metaRequestCounter = 0;
	let settingsRequested = false;
	let collectionsRequestCounter = 0;
	const handlers = [
		rest.get('https://api.zotero.org/itemTypes', (req, res, ctx) => {
			metaRequestCounter++;
			return res(ctx.json(itemTypes));
		}),
		rest.get('https://api.zotero.org/itemFields', (req, res, ctx) => {
			metaRequestCounter++;
			return res(ctx.json(itemFields));
		}),
		rest.get('https://api.zotero.org/creatorFields', (req, res, ctx) => {
			metaRequestCounter++;
			return res(ctx.json(creatorFields));
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
		metaRequestCounter = 0;
		settingsRequested = false;
		collectionsRequestCounter = 0;
	});

	afterEach(() => server.resetHandlers());

	afterAll(() => server.close());

	test('Shows Z while fetching data', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(metaRequestCounter).toBe(3));
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

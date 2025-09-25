import '@testing-library/jest-dom'
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node'
import { screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';

applyAdditionalJestTweaks();

describe('Loading Screen', () => {
	let settingsRequested = false;
	let collectionsRequestCounter = 0;
	let server;

	beforeAll(() => {
		const handlers = [
			http.get('https://api.zotero.org/users/475425/settings/tagColors', () => {
				settingsRequested = true;
				return HttpResponse.json({});
			}),
			http.get('https://api.zotero.org/users/475425/collections', async ({ request }) => {
				// first request (`start` is null or 0) is immediate,
				// subsequent requests are delayed so we get a spinner
				await delay(new URL(request.url).searchParams.get('start') ? 100 : 0);
				collectionsRequestCounter++;
				return HttpResponse.json([], {
					headers: { 'Total-Results': '5142' },
				});
			}),
			http.get('https://api.zotero.org/users/475425/items/top', () => {
				return HttpResponse.json([], {
					headers: {
						'Total-Results': '0',
					},
				});
			}),
			http.get('https://api.zotero.org/users/475425/items/top/tags', () => {
				return HttpResponse.json([], {
					headers: {
						'Total-Results': '0',
					},
				});
			})
		];

		server = setupServer(...handlers);

		server.listen({
			onUnhandledRequest: (req) => {
				// https://github.com/mswjs/msw/issues/946#issuecomment-1202959063
				test(`${req.method} ${req.url} is not handled`, () => { });
			},
		});
	});

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/' });;
		settingsRequested = false;
		collectionsRequestCounter = 0;
	});

	afterEach(() => server.resetHandlers());

	afterAll(() => server.close());

	test('Shows Z while fetching data', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
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

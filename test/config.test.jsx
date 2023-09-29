import '@testing-library/jest-dom'
import { rest, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';
import schema from './fixtures/response/schema';

const minStateWithApiAuthorityPart = {
	...minState,
	config: {
		...minState.config,
		apiConfig: {
			...minState.config.apiConfig,
			apiAuthorityPart: 'bazinga.zotero.org',
		},
	},
};

applyAdditionalJestTweaks();

describe('config', () => {
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

	test(`Use apiAuthorityPart from config`, async () => {
		let schemaRequested = false;
		let settingsRequested = false;
		let collectionsRequested = false;
		let itemsRequested = false;
		let tagsRequested = false;
		server.use(
			rest.get('https://bazinga.zotero.org/schema', () => {
				schemaRequested = true;
				return HttpResponse.json(schema);
			}),
			rest.get('https://bazinga.zotero.org/users/475425/settings/tagColors', () => {
				settingsRequested = true;
				return HttpResponse.json({});
			}),
			rest.get('https://bazinga.zotero.org/users/475425/collections', () => {
				collectionsRequested = true;
				return HttpResponse.json([], {
					headers: { 'Total-Results': '42' }
				});
			}),
			rest.get('https://bazinga.zotero.org/users/475425/items/top', () => {
				itemsRequested = true;
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			rest.get('https://bazinga.zotero.org/users/475425/items/top/tags', () => {
				tagsRequested = true;
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
		);
		renderWithProviders(<MainZotero />, { preloadedState: minStateWithApiAuthorityPart });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(schemaRequested).toBe(true));
		await waitFor(() => expect(settingsRequested).toBe(true));
		await waitFor(() => expect(collectionsRequested).toBe(true));
		await waitFor(() => expect(itemsRequested).toBe(true));
		await waitFor(() => expect(tagsRequested).toBe(true));
	});
});

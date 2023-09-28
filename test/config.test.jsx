import '@testing-library/jest-dom'
import { rest } from 'msw'
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
			rest.get('https://bazinga.zotero.org/schema', (req, res, ctx) => {
				schemaRequested = true;
				return res(ctx.json(schema));
			}),
			rest.get('https://bazinga.zotero.org/users/475425/settings/tagColors', (req, res, ctx) => {
				settingsRequested = true;
				return res(ctx.json({}));
			}),
			rest.get('https://bazinga.zotero.org/users/475425/collections', (req, res) => {
				return res((res) => {
					res.headers.set('Total-Results', 42);
					res.body = JSON.stringify([]);
					collectionsRequested = true;
					return res;
				});
			}),
			rest.get('https://bazinga.zotero.org/users/475425/items/top', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 0);
					res.body = JSON.stringify([]);
					itemsRequested = true;
					return res;
				});
			}),
			rest.get('https://bazinga.zotero.org/users/475425/items/top/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 0);
					res.body = JSON.stringify([]);
					tagsRequested = true;
					return res;
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

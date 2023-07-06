/*
* @jest-environment ./test/utils/zotero-env.js
*/
import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { getByRole, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';
import schema from './fixtures/response/schema';
// import searchResults from './fixtures/response/zotero-user-search-results.json';
// import searchResultsTags from './fixtures/response/zotero-user-search-results-tags.json';
import groups from './fixtures/response/min-user-groups.json';
import collections from './fixtures/response/min-user-collections.json';
import groupCollections from './fixtures/response/min-user-group-collections.json';

applyAdditionalJestTweaks();

describe('Unexpected URL', () => {
	const handlers = [
		rest.get('https://api.zotero.org/schema', (req, res, ctx) => {
			return res(ctx.json(schema));
		}),
		rest.get('https://api.zotero.org/users/475425/settings', (req, res, ctx) => {
			return res(ctx.json({}));
		}),
		rest.get('https://api.zotero.org/users/475425/collections', (req, res) => {
			return res((res) => {
				res.headers.set('Total-Results', 1);
				res.body = JSON.stringify(collections);
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
		rest.get('https://api.zotero.org/users/475425/collections/KCUHMRNZ/items/top', (req, res) => {
			return res(res => {
				res.headers.set('Total-Results', 0);
				res.body = JSON.stringify([]);
				return res;
			});
		}),
		rest.get('https://api.zotero.org/users/475425/collections/KCUHMRNZ/items/top/tags', (req, res) => {
			return res(res => {
				res.headers.set('Total-Results', 0);
				res.body = JSON.stringify([]);
				return res;
			});
		}),
		rest.get('https://api.zotero.org/users/475425/collections/12345678/items/top', (req, res) => {
			return res(res => {
				res.status = 404;
				return res;
			});
		}),
		rest.get('https://api.zotero.org/users/475425/collections/12345678/items/top/tags', (req, res) => {
			return res(res => {
				res.status = 404;
				return res;
			});
		}),
		rest.get('https://api.zotero.org/users/475425/groups', (req, res) => {
			return res(res => {
				res.headers.set('Total-Results', 1);
				res.body = JSON.stringify(groups);
				return res;
			});
		}),
		rest.get('https://api.zotero.org/groups/42/collections', (req, res) => {
			return res((res) => {
				res.headers.set('Total-Results', 1);
				res.body = JSON.stringify(groupCollections);
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
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test(`Should redirect if URL contains invalid collection key`, async () => {
		window.location = new URL('http://localhost/testuser/collections/12345678');
		const { history } = renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await screen.findByRole('grid', { name: 'items' });
		expect(history.location.pathname).toBe('/testuser/library');
	});

	test(`Shouldn't change URL when opening another library`, async () => {
		window.location = new URL('http://localhost/testuser/collections/KCUHMRNZ');
		const tweakedState = { ...minState };
		tweakedState.config.includeUserGroups = true;
		const user = userEvent.setup();
		const { history } = renderWithProviders(<MainZotero />, { preloadedState: tweakedState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await screen.findByRole('grid', { name: 'items' });
		expect(screen.queryByRole('treeitem', { name: 'group library collection', expanded: false })).not.toBeInTheDocument();
		const groupLibTreeItem = screen.getByRole('treeitem', { name: 'test user public', expanded: false });
		await user.click(getByRole(groupLibTreeItem, 'button', { name: 'Expand' }));

		expect(await screen.findByRole('treeitem', { name: 'group library collection' })).toBeInTheDocument();
		expect(history.location.pathname).toBe('/testuser/collections/KCUHMRNZ');
	});
});

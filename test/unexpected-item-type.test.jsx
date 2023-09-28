import '@testing-library/jest-dom'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { findByRole, getByRole, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';
import schema from './fixtures/response/schema';
import annotationItems from './fixtures/response/annotation-item.json';

applyAdditionalJestTweaks();

describe('Unexpected Item Types', () => {
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
		server.use(
			rest.get('https://api.zotero.org/schema', (req, res, ctx) => {
				return res(ctx.json(schema));
			}),
			rest.get('https://api.zotero.org/users/475425/settings/tagColors', (req, res, ctx) => {
				return res(ctx.json({}));
			}),
			rest.get('https://api.zotero.org/users/475425/collections', (req, res) => {
				return res((res) => {
					res.headers.set('Total-Results', 42);
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
		);
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test(`Handle unexpected top level annotation`, async () => {
		let itemsRequested = false;
		server.use(
			rest.get('https://api.zotero.org/users/475425/items/top', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 1);
					res.body = JSON.stringify(annotationItems);
					itemsRequested = true;
					return res;
				});
			})
		);
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(itemsRequested).toBe(true));
		const grid = await screen.findByRole('grid', { name: 'items' });
		await userEvent.click(await findByRole(grid, 'row', { name: '' }));

		expect(await screen.findByRole('combobox', { name: 'Item Type' }))
			.toHaveTextContent('annotation');
	});

	// this should never happen, but if it does, we should handle it gracefully
	// also need an item type for which we're guaranteed not to have an icon to
	// test fallback
	test(`Handle unexpected top level item type`, async () => {
		let itemsRequested = false;
		server.use(
			rest.get('https://api.zotero.org/users/475425/items/top', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 1);
					res.body = JSON.stringify([
						{ ...annotationItems[0],
							data: {
								...annotationItems[0].data,
								itemType: 'badItemType'
						}}]);
					itemsRequested = true;
					return res;
				});
			})
		);
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(itemsRequested).toBe(true));
		const grid = await screen.findByRole('grid', { name: 'items' });
		const row = await findByRole(grid, 'row', { name: '' });
		const icon = getByRole(row, 'img');

		expect(icon).toHaveClass('icon icon-document');

		await userEvent.click(row);
		expect(await screen.findByRole('combobox', { name: 'Item Type' }))
			.toHaveTextContent('badItemType');
	});
});

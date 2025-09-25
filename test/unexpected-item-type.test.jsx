import '@testing-library/jest-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { findByRole, getAllByRole, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import minState from './fixtures/state/minimal.json';
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
		window.jsdom.reconfigure({ url: 'http://localhost/' });;
		server.use(
			http.get('https://api.zotero.org/users/475425/settings/tagColors', () => {
				return HttpResponse.json({});
			}),
			http.get('https://api.zotero.org/users/475425/collections', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '42' }
				});
			}),
			http.get('https://api.zotero.org/users/475425/items/top/tags', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
		);
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test(`Handle unexpected top level annotation`, async () => {
		let itemsRequested = false;
		server.use(
			http.get('https://api.zotero.org/users/475425/items/top', () => {
				itemsRequested = true;
				return HttpResponse.json(annotationItems, {
					headers: { 'Total-Results': '1' }
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
			http.get('https://api.zotero.org/users/475425/items/top', () => {
				itemsRequested = true;
				return HttpResponse.json([
					{
						...annotationItems[0],
						data: {
							...annotationItems[0].data,
							itemType: 'badItemType'
						}
					}], {
					headers: { 'Total-Results': '1' }
				});
			})
		);
		renderWithProviders(<MainZotero />, { preloadedState: minState });
		expect(screen.getByRole('img', { name: 'Loading' })).toBeInTheDocument();
		await waitFor(() => expect(itemsRequested).toBe(true));
		const grid = await screen.findByRole('grid', { name: 'items' });
		const row = await findByRole(grid, 'row', { name: '' });
		const icon = getAllByRole(row, 'img')[0];

		expect(icon).toHaveClass('icon icon-document');

		await userEvent.click(row);
		expect(await screen.findByRole('combobox', { name: 'Item Type' }))
			.toHaveTextContent('badItemType');
	});
});

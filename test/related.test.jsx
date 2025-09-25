/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { screen, findAllByRole, getByRole, getByText, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';
import getRelatedItemsResponse from './fixtures/response/test-user-get-item-by-key-66LW9WRP-PEZF7SPI.json';
import postAddRelatedItemsResponse from './fixtures/response/test-user-post-add-related.json';
import getItemsInCollectionDogResponse from './fixtures/response/test-user-get-items-in-collection-dogs.json';

const state = JSONtoState(stateRaw);

describe('Item info', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	applyAdditionalJestTweaks();

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
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details' });;
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Adds a related item', async () => {
		let relatedItemsFetched = false;
		let hasBeenPosted = false;
		server.use(
			http.get('https://api.zotero.org/users/1/items', async ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemKey')).toBe('66LW9WRP,PEZF7SPI');
				relatedItemsFetched	= true;
				return HttpResponse.json(getRelatedItemsResponse, {
					headers: { 'Total-Results': '2' }
				});
			}),

			http.get('https://api.zotero.org/users/1/collections/WTTJ2J56/items/top', async () => {
				return HttpResponse.json(getItemsInCollectionDogResponse, {
					headers: { 'Total-Results': '7' }
				});
			}),

			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				const mainItem = items.find(item => item.key === 'VR82JUX8');
				const relatedItem1 = items.find(item => item.key === '66LW9WRP');
				const relatedItem2 = items.find(item => item.key === 'PEZF7SPI');
				expect(mainItem.relations['dc:relation']).toHaveLength(2);
				expect(relatedItem1.relations['dc:relation']).toBe("http://zotero.org/users/1/items/VR82JUX8");
				expect(relatedItem2.relations['dc:relation']).toBe("http://zotero.org/users/1/items/VR82JUX8");
				hasBeenPosted = true;

				return HttpResponse.json(postAddRelatedItemsResponse, {
					headers: { 'Last-Modified-Version': ++state.libraries.u1.sync.version }
				});
			})
		);
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		await user.click(screen.getByRole('tab', { name: 'Related' }));
		const relatedTabPanel = await screen.findByRole('tabpanel', { name: 'Related' });
		expect(getByText(relatedTabPanel, "0 related items")).toBeInTheDocument();
		await user.click(getByRole(relatedTabPanel, 'button', { name: 'Add Related Item' }));
		const dialog = screen.getByRole('dialog', { name: 'Add Related Items' });
		expect(dialog).toBeInTheDocument();
		const row = getByRole(dialog, 'row', { name: 'Understanding dogs' });
		await user.click(row);
		await user.keyboard('[OSLeft>][ControlRight>]');
		const row2 = getByRole(dialog, 'row', { name: 'Vision in dogs' });
		await user.click(row2);
		await user.keyboard('[/OSLeft>][/ControlRight]');
		await user.click(getByRole(dialog, 'button', { name: 'Add' }));

		await waitFor(() => {
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		const relatedItems = await findAllByRole(relatedTabPanel, 'listitem');
		expect(relatedItems).toHaveLength(2);
		expect(getByText(relatedTabPanel, "2 related items")).toBeInTheDocument();

		expect(relatedItemsFetched).toBe(true);
		expect(hasBeenPosted).toBe(true);
	});

});

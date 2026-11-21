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
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import { setupStore } from '../src/js/store';
import { MainZotero } from '../src/js/component/main';
import { addRelatedItems } from '../src/js/actions/items-write';
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
	setupMSWLifecycle(server);

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details' });;
	});

	test('Adds a related item', async () => {
		let relatedItemsFetched = false;
		let hasBeenPosted = false;
		server.use(
			http.get('https://api.zotero.org/users/1/items', async () => {
				relatedItemsFetched = true;
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

		// -- items picked in the dialog are already loaded
		expect(relatedItemsFetched).toBe(false);
		expect(hasBeenPosted).toBe(true);
	});

});

describe('addRelatedItems with related items not loaded', () => {
	const handlers = [];
	const server = setupServer(...handlers);
	setupMSWLifecycle(server);

	test('Fetches the related items and adds the reciprocal relations', async () => {
		const testState = JSONtoState(stateRaw);
		for (const key of ['66LW9WRP', 'PEZF7SPI']) {
			delete testState.libraries.u1.items[key];
			delete testState.libraries.u1.dataObjects[key];
		}

		let requestedItemKeys = null;
		let postedItems = null;

		server.use(
			http.get('https://api.zotero.org/users/1/items', ({ request }) => {
				requestedItemKeys = new URL(request.url).searchParams.get('itemKey');
				return HttpResponse.json(getRelatedItemsResponse, {
					headers: { 'Total-Results': '2' }
				});
			}),

			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				postedItems = await request.json();
				return HttpResponse.json(postAddRelatedItemsResponse, {
					headers: { 'Last-Modified-Version': ++testState.libraries.u1.sync.version }
				});
			}),
		);

		const store = setupStore(testState);
		await store.dispatch(addRelatedItems('VR82JUX8', ['66LW9WRP', 'PEZF7SPI']));

		expect(requestedItemKeys).toBe('66LW9WRP,PEZF7SPI');
		expect(postedItems).toHaveLength(3);
		expect(postedItems.find(item => item.key === 'VR82JUX8').relations['dc:relation']).toHaveLength(2);
		expect(postedItems.find(item => item.key === '66LW9WRP').relations['dc:relation']).toBe('http://zotero.org/users/1/items/VR82JUX8');
		expect(postedItems.find(item => item.key === 'PEZF7SPI').relations['dc:relation']).toBe('http://zotero.org/users/1/items/VR82JUX8');
	});
});

describe('addRelatedItems chunking', () => {
	const handlers = [];
	const server = setupServer(...handlers);
	setupMSWLifecycle(server);

	test('Chunks POST requests when adding more than 50 related items', async () => {
		const itemCount = 55;
		const relatedItemKeys = [];
		const extraItems = {};

		// -- Create 55 dummy related items in state
		for (let i = 0; i < itemCount; i++) {
			const key = `RLTD${String(i).padStart(4, '0')}`;
			relatedItemKeys.push(key);
			extraItems[key] = {
				key,
				version: 1,
				itemType: 'journalArticle',
				title: `Related item ${i}`,
				collections: [],
				relations: {},
			};
		}

		const testState = JSONtoState(stateRaw);
		Object.assign(testState.libraries.u1.items, extraItems);

		const postRequests = [];
		let version = testState.libraries.u1.sync.version;

		server.use(
			// -- Handle fetchItemsByKeys GET requests
			http.get('https://api.zotero.org/users/1/items', ({ request }) => {
				const url = new URL(request.url);
				const keys = url.searchParams.get('itemKey').split(',');
				const responseItems = keys.map(key => ({
					key,
					version: 1,
					library: { type: 'user', id: 1, name: 'testuser', links: {} },
					links: {},
					meta: {},
					data: {
						key,
						version: 1,
						itemType: 'journalArticle',
						title: `Related item ${key}`,
						collections: [],
						relations: {},
					},
				}));

				return HttpResponse.json(responseItems, {
					headers: { 'Total-Results': String(keys.length) }
				});
			}),

			// -- Handle updateMultipleItems POST requests
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				postRequests.push(items);

				const successful = {};
				const success = {};
				items.forEach((item, index) => {
					const idx = String(index);
					success[idx] = item.key;
					successful[idx] = {
						key: item.key,
						version: ++version,
						library: { type: 'user', id: 1, name: 'testuser', links: {} },
						links: {},
						meta: {},
						data: {
							key: item.key,
							version,
							itemType: 'journalArticle',
							title: `Item ${item.key}`,
							collections: [],
							relations: item.relations || {},
						},
					};
				});

				return HttpResponse.json(
					{ successful, success, unchanged: {}, failed: {} },
					{ headers: { 'Last-Modified-Version': String(version) } }
				);
			}),
		);

		const store = setupStore(testState);
		await store.dispatch(addRelatedItems('VR82JUX8', relatedItemKeys));

		// -- 56 total patches (55 related + 1 source) should be split into 2 requests
		expect(postRequests).toHaveLength(2);
		expect(postRequests[0]).toHaveLength(50);
		expect(postRequests[1]).toHaveLength(6);
	});
});

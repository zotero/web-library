/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node';
import { getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import { setupStore } from '../src/js/store';
import { MainZotero } from '../src/js/component/main';
import { createEmptyParentItems } from '../src/js/actions/parent';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-top-level-attachment-view.json';
import searchByIdentifier from './fixtures/response/search-by-identifier-recognize.json';
import responseAddByIdentifier from './fixtures/response/test-user-add-by-identifier-recognize.json';
import responseAddParentManual from './fixtures/response/test-user-add-parent-manual.json';
import reponseAddParentUpdateAttachmentItem from './fixtures/response/test-user-add-parent-update-attachment-item.json';

const state = JSONtoState(stateRaw);

describe('Create Parent Item', () => {
	const handlers = [
		http.get('https://api.zotero.org/users/1/items/UMPPCXU4/file/view/url', () => {
			return HttpResponse.text('https://files.zotero.net/attention-is-all-you-need.pdf');
		}),
		http.get('https://files.zotero.net/attention-is-all-you-need.pdf', () => {
			return HttpResponse.text('');
		}),
		http.get('https://api.zotero.org/users/1/collections/CSB4KZUU/items/top/tags', () => {
			return HttpResponse.json([], { headers: { 'Total-Results': '0' } });
			}),
	];
	const server = setupServer(...handlers)
	applyAdditionalJestTweaks();
	setupMSWLifecycle(server);

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4' });;
	});

	test('Creates parent item using an identifier', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenSearched = false;
		let hasCreatedParentItem = false;
		let hasPatchedAttachmentItem = false;
		let version = state.libraries.u1.sync.version;

		server.use(
			http.post('https://localhost/translate/search', async ({ request }) => {
				const identifier = await request.text();
				expect(identifier).toEqual('1706.03762');
				hasBeenSearched = true;
				await delay(100);
				return HttpResponse.json(searchByIdentifier);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('preprint');
				expect(items[0].DOI).toBe('10.48550/arXiv.1706.03762');
				expect(items[0].title).toEqual('Attention Is All You Need');
				expect(items[0].collections).toEqual(["CSB4KZUU"]);
				hasCreatedParentItem = true;
				version++;
				await delay(100);
				return HttpResponse.json(responseAddByIdentifier, { headers: { 'Last-Modified-Version': version } });
			}),
			http.patch('https://api.zotero.org/users/1/items/UMPPCXU4', async ({ request }) => {
				const item = await request.json();
				expect(item.parentItem).toBe('S8CIV6VJ');
				expect(item.collections).toEqual([]);
				hasPatchedAttachmentItem = true;
				version++;
				await delay(100);
				return new HttpResponse(null, { status: 204, headers: { 'Last-Modified-Version': version } });
			}),
			// item details pane is still active hence this request can happen
			http.get('https://api.zotero.org/users/1/items/S8CIV6VJ/children', async () => {
				return HttpResponse.json([], { headers: { 'Total-Results': '0' } });
			}),
		);

		expect(screen.getByRole('row', { name: 'attention-is-all-you-need.pdf' }) ).toHaveAttribute('aria-selected', 'true');
		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });
		await user.click(getByRole(toolbar, 'button', { name: 'More' }));
		await waitForPosition();
		await user.click(screen.getByRole('menuitem', { name: 'Create Parent Item' }));
		const dialog = await screen.findByRole('dialog', { name: 'Create Parent Item' });
		await waitFor(() => expect(getByRole(dialog, 'textbox', { name: 'Enter a DOI, ISBN, PMID, arXiv ID, or ADS Bibcode to identify this file:' })).toHaveFocus());
		const input = getByRole(dialog, 'textbox', { name: 'Enter a DOI, ISBN, PMID, arXiv ID, or ADS Bibcode to identify this file:' });
		await user.type(input, '1706.03762{enter}', { skipClick: true });

		expect(await screen.findByRole('row', { name: 'Attention Is All You Need' })).toBeInTheDocument();
		expect(screen.queryByRole('row', { name: 'attention-is-all-you-need.pdf' })).not.toBeInTheDocument

		expect(hasBeenSearched).toBe(true);
		expect(hasCreatedParentItem).toBe(true);
		expect(hasPatchedAttachmentItem).toBe(true);
	});

	test('Shows an info message when the identifier is not recognized', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenSearched = false;

		server.use(
			http.post('https://localhost/translate/search', async ({ request }) => {
				const identifier = await request.text();
				expect(identifier).toEqual('1706.03762');
				hasBeenSearched = true;
				await delay(100);
				return HttpResponse.text('No items returned from any translator', { status: 501 });
			}),
			http.post('https://api.zotero.org/users/1/items', () => {
				throw new Error('No item should be created when the identifier is not recognized');
			}),
		);

		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });
		await user.click(getByRole(toolbar, 'button', { name: 'More' }));
		await waitForPosition();
		await user.click(screen.getByRole('menuitem', { name: 'Create Parent Item' }));
		const dialog = await screen.findByRole('dialog', { name: 'Create Parent Item' });
		const input = getByRole(dialog, 'textbox', { name: 'Enter a DOI, ISBN, PMID, arXiv ID, or ADS Bibcode to identify this file:' });
		await waitFor(() => expect(input).toHaveFocus());
		await user.type(input, '1706.03762{enter}', { skipClick: true });

		const toast = await screen.findByText(
			'Zotero could not find any identifiers in your input. Please verify your input and try again.'
		);
		expect(toast).toHaveClass('message', 'info');
		expect(toast.querySelector('header')).toHaveTextContent('Info');
		expect(hasBeenSearched).toBe(true);

		// modal stays open so the identifier can be corrected or retried
		const reopenedDialog = await screen.findByRole('dialog', { name: 'Create Parent Item' });
		const retryInput = getByRole(reopenedDialog, 'textbox', { name: 'Enter a DOI, ISBN, PMID, arXiv ID, or ADS Bibcode to identify this file:' });
		await waitFor(() => expect(retryInput).toHaveFocus());
		expect(retryInput).toHaveValue('1706.03762');
	});

	test('Creates empty parent item', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let postCounter = 0;
		let hasCreatedParentItem = false;
		let hasPatchedAttachmentItem = false;
		let version = state.libraries.u1.sync.version;

		server.use(
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				let response;
				version++;
				if (postCounter === 0) {
					// first post is for creating the parent items (in this case just the one)
					expect(items[0].itemType).toBe('document');
					expect(items[0].title).toEqual('attention-is-all-you-need');
					expect(items[0].collections).toEqual(["CSB4KZUU"]);
					hasCreatedParentItem = true;
					response = HttpResponse.json(responseAddParentManual, { headers: { 'Last-Modified-Version': version } });
				} else {
					// second post updates parentItem of the attachment item(s)
					expect(items[0].key).toBe('UMPPCXU4');
					expect(items[0].parentItem).toBe('AUPETCJW');
					expect(items[0].collections).toEqual([]);
					hasPatchedAttachmentItem = true;
					response = HttpResponse.json(reponseAddParentUpdateAttachmentItem, { headers: { 'Last-Modified-Version': version } });
				}
				postCounter++;
				await delay(100);
				return response;
			}),
			// item details pane is still active hence this request can happen
			http.get('https://api.zotero.org/users/1/items/AUPETCJW/children', async () => {
				return HttpResponse.json([], { headers: { 'Total-Results': '0' } });
			}),
		);

		expect(screen.getByRole('row', { name: 'attention-is-all-you-need.pdf' })).toHaveAttribute('aria-selected', 'true');
		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });
		await user.click(getByRole(toolbar, 'button', { name: 'More' }));
		await waitForPosition();
		await user.click(screen.getByRole('menuitem', { name: 'Create Parent Item' }));
		const dialog = await screen.findByRole('dialog', { name: 'Create Parent Item' });
		await user.click(getByRole(dialog, 'button', { name: 'Manual Entry' }));
		expect(await screen.findByRole('row', { name: 'attention-is-all-you-need' })).toBeInTheDocument();
		expect(screen.queryByRole('row', { name: 'attention-is-all-you-need.pdf' })).not.toBeInTheDocument

		expect(hasCreatedParentItem).toBe(true);
		expect(hasPatchedAttachmentItem).toBe(true);
	});
});

describe('createEmptyParentItems chunking', () => {
	const handlers = [];
	const server = setupServer(...handlers);
	setupMSWLifecycle(server);

	test('Chunks POST requests when creating parents for more than 50 items', async () => {
		const itemCount = 55;
		const itemKeys = [];
		const extraItems = {};

		// -- Create 55 top-level attachment items in state
		for (let i = 0; i < itemCount; i++) {
			const key = `PRNT${String(i).padStart(4, '0')}`;
			itemKeys.push(key);
			extraItems[key] = {
				key,
				version: 1,
				itemType: 'attachment',
				linkMode: 'imported_file',
				title: `file-${i}.pdf`,
				filename: `file-${i}.pdf`,
				contentType: 'application/pdf',
				collections: ['CSB4KZUU'],
				parentItem: false,
				tags: [],
				relations: {},
				[Symbol.for('meta')]: {},
				[Symbol.for('links')]: {},
			};
		}

		const testState = JSONtoState(stateRaw);
		// -- items is an alias for dataObjects in the libraries reducer,
		// -- so we must add to both for the state to survive reducer runs
		Object.assign(testState.libraries.u1.items, extraItems);
		Object.assign(testState.libraries.u1.dataObjects, extraItems);

		const postRequests = [];
		let version = testState.libraries.u1.sync.version;
		let createdKeyCounter = 0;

		server.use(
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				postRequests.push(items);

				const successful = {};
				const success = {};
				items.forEach((item, index) => {
					const idx = String(index);
					if (item.key) {
						// -- updateMultipleItems: item already has a key
						success[idx] = item.key;
						successful[idx] = {
							key: item.key,
							version: ++version,
							library: { type: 'user', id: 1, name: 'testuser', links: {} },
							links: {},
							meta: {},
							data: { ...item, version },
						};
					} else {
						// -- createItems: new item without a key
						const newKey = `NEWP${String(createdKeyCounter++).padStart(4, '0')}`;
						success[idx] = newKey;
						successful[idx] = {
							key: newKey,
							version: ++version,
							library: { type: 'user', id: 1, name: 'testuser', links: {} },
							links: {},
							meta: { numChildren: 0 },
							data: { ...item, key: newKey, version, tags: item.tags || [] },
						};
					}
				});

				return HttpResponse.json(
					{ successful, success, unchanged: {}, failed: {} },
					{ headers: { 'Last-Modified-Version': String(version) } }
				);
			}),
		);

		const store = setupStore(testState);
		await store.dispatch(createEmptyParentItems(itemKeys, 'u1'));

		// -- 55 items chunked into batches of 50:
		// -- 2 createItems POSTs (50 + 5), then 2 updateMultipleItems POSTs (50 + 5)
		expect(postRequests).toHaveLength(4);

		// -- First two are createItems (no 'key' on items)
		expect(postRequests[0]).toHaveLength(50);
		expect(postRequests[0][0].key).toBeUndefined();
		expect(postRequests[1]).toHaveLength(5);
		expect(postRequests[1][0].key).toBeUndefined();

		// -- Last two are updateMultipleItems (items have 'key' and 'parentItem')
		expect(postRequests[2]).toHaveLength(50);
		expect(postRequests[2][0].key).toBeDefined();
		expect(postRequests[2][0].parentItem).toBeDefined();
		expect(postRequests[3]).toHaveLength(5);
		expect(postRequests[3][0].key).toBeDefined();
		expect(postRequests[3][0].parentItem).toBeDefined();
	});
});

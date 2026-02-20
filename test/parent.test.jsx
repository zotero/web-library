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
import { MainZotero } from '../src/js/component/main';
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
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4' });;
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

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

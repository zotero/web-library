/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import {  waitFor, fireEvent } from '@testing-library/react';

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-note-view.json';
import newItemEmbeddedImage from './fixtures/response/new-item-embedded-image.json';
import testUserAddEmbeddedImage from './fixtures/response/test-user-add-embedded-image.json';

const state = JSONtoState(stateRaw);

describe('Note Editor', () => {
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
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/BLVYJQMH/note/GNVWD3U4/item-details' });;
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());


	test("It adds an image to a note and keeps track of version", async () => {
		const libVer = state.libraries.u1.sync.version;
		const itemVer = state.libraries.u1.items.GNVWD3U4.version;
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		let patchCounter = 0;
		let nextVersion = libVer;

		server.use(
			http.patch('https://api.zotero.org/users/1/items/GNVWD3U4', async ({ request }) => {
				const patch = await request.json();
				if (patchCounter === 0) {
					expect(patch.note).toBe('new value <img src="test" />');
					expect(request.headers.get('If-Unmodified-Since-Version')).toBe(`${itemVer}`);
					delay(100); // we delay this response to simulate #529
					nextVersion++; // this is the correct version
				} else if (patchCounter === 1) {
					expect(patch.note).toBe('new value <img src="test" /> updated');
					expect(request.headers.get('If-Unmodified-Since-Version')).toBe(`${libVer + 1}`);
					nextVersion++;
				}
				patchCounter++;
				return new HttpResponse(null, { status: 204, headers: { 'Last-Modified-Version': nextVersion } });
			}),
			http.get('https://api.zotero.org/items/new', ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('embedded_image');
				return HttpResponse.json(newItemEmbeddedImage);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('embedded_image');
				expect(items[0].parentItem).toBe('GNVWD3U4');
				expect(items[0].contentType).toBe('image/gif');

				return HttpResponse.json(testUserAddEmbeddedImage);
			}),
			http.post('https://api.zotero.org/users/1/items/EMBEDIMG/file', async ({ request }) => {
				const body = await request.text();
				expect(body).toMatch(/filename=image.gif/);
				return HttpResponse.json({ exists: 1 });
			}),
			http.get('https://api.zotero.org/users/1/items', ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemKey')).toBe('GNVWD3U4');

				return HttpResponse.json([state.libraries.u1.items.GNVWD3U4], {
					headers: {
						'Total-Results': '1',
					},
				});
			})
		);


		const { container } = renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitFor(() => expect(container.querySelector('iframe')).toBeInTheDocument(), { timeout: 3000 });

		const iframe = container.querySelector('iframe');
		let itemKey = null;
		iframe.contentWindow.postMessage = (msg) => {
			const { action, instanceID } = msg;
			if(action === 'init') {
				itemKey = instanceID;
			}
		};
		fireEvent(iframe, new Event('load', { bubbles: false, cancelable: false }));
		await waitFor(() => expect(itemKey).toBe('GNVWD3U4'), { timeout: 3000 });

		fireEvent(iframe.contentWindow, new MessageEvent('message', { source: iframe.contentWindow, data: { instanceID: itemKey, message: { action: 'initialized' } } }));
		fireEvent(iframe.contentWindow, new MessageEvent('message', { source: iframe.contentWindow, data: { instanceID: itemKey, message: { action: 'update', value: 'new value <img src="test" />' }}}));
		fireEvent(iframe.contentWindow, new MessageEvent('message', { source: iframe.contentWindow, data: { instanceID: itemKey, message: { action: 'importImages', images: [{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }] }}}));
		await waitFor(() => expect(patchCounter).toBe(1), { timeout: 3000 });
		fireEvent(iframe.contentWindow, new MessageEvent('message', { source: iframe.contentWindow, data: { instanceID: itemKey, message: { action: 'update', value: 'new value <img src="test" /> updated' } } }));
		await waitFor(() => expect(patchCounter).toBe(2), { timeout: 3000 });
	});
});

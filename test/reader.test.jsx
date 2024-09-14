/*
* @jest-environment ./test/utils/zotero-env.js
*/
import '@testing-library/jest-dom';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { act, waitFor, fireEvent } from '@testing-library/react';

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import { JSONtoState, getStateWithout } from './utils/state';
import stateRaw from './fixtures/state/desktop-test-user-reader-view.json';
import parentStateRaw from './fixtures/state/desktop-test-user-reader-parent-item-view.json';
import newItemAnnotationNote from "./fixtures/response/new-item-annotation-note.json";
import testUserCreateAnnotation from "./fixtures/response/test-user-create-annotation.json";
import testUserReaderChildren from "./fixtures/response/test-user-reader-children.json";

jest.mock('../src/js/common/pdf-worker.js');
// need to mock structuredClone, otherwise web library shows incompatible browser error message where reader iframe would normally be. See #548
global.structuredClone = jest.fn();

const state = JSONtoState(stateRaw);
const parentState = JSONtoState(parentStateRaw);

const noteAnnotation = {
	"libraryID": "",
	"id": "Z1Z2Z3Z4",
	"type": "note",
	"readOnly": false,
	"comment": "hello note annotation",
	"pageLabel": "1",
	"color": "#a28ae5",
	"sortIndex": "00000|000000|00024",
	"position": {
		"pageIndex": 0,
		"rects": [
			[
				77.00547368421056,
				745.9468947368422,
				99.00547368421056,
				767.9468947368422
			]
		]
	},
	"tags": [],
	"dateModified": "2023-08-22T13:29:19.393Z",
	"onlyTextOrComment": true
};

describe('Reader', () => {
	const handlers = [
		http.get('https://api.zotero.org/users/1/items/N2PJUHD6/file/view/url', () => {
			return HttpResponse.text('https://files.zotero.net/some-file-attachment.pdf');
		}),
		http.get('https://files.zotero.net/some-file-attachment.pdf', () => {
			return HttpResponse.text('');
		}),
		http.get('https://api.zotero.org/users/1/settings/tagColors', async () => {
			return HttpResponse.json({ value: [], version: 0 });
		}),
		http.get('https://api.zotero.org/users/1/settings/lastPageIndex_u_N2PJUHD6', async () => {
			return HttpResponse.json({ value: 0, version: 0 });
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
		window.location = new URL('http://localhost/testuser/items/KBFTPTI4/attachment/N2PJUHD6/reader');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Displays reader', async () => {
		const { container } = renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitFor(() => expect(container.querySelector('iframe')).toBeInTheDocument(), { timeout: 3000 });
		const iframe = container.querySelector('iframe');
		iframe.contentWindow.createReader = jest.fn();
		fireEvent(iframe, new Event('load', { bubbles: false, cancelable: false }));
		expect(iframe.contentWindow.createReader).toHaveBeenCalled();
	});

	test('Redirects to the best attachment if URL points at a top-level item, saves annotations against correct item', async () => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/items/KBFTPTI4/reader')

		let requestedAttachmentChildItems = false;
		let requestedTpl = false;
		let postedAnnotation = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items/N2PJUHD6/children', () => {
				requestedAttachmentChildItems = true;
				return HttpResponse.json(testUserReaderChildren, {
					headers: { 'Total-Results': testUserReaderChildren.length }
				});
			}),
			http.get('https://api.zotero.org/items/new', ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('annotation');
				expect(url.searchParams.get('annotationType')).toBe('note');
				requestedTpl = true;
				return HttpResponse.json(newItemAnnotationNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				expect(items[0].key).toBe('Z1Z2Z3Z4');
				expect(items[0].itemType).toBe('annotation');
				expect(items[0].parentItem).toBe('N2PJUHD6');
				postedAnnotation = true;
				return HttpResponse.json(testUserCreateAnnotation, {
					headers: { 'Last-Modified-Version': 12345 }
				});
			})
		);

		const { history, container } = renderWithProviders(<MainZotero />, { preloadedState: getStateWithout(parentState, 'libraries.u1.itemsByParent.N2PJUHD6') });

		await waitFor(() => expect(container.querySelector('iframe')).toBeInTheDocument(), { timeout: 3000 });

		// URL has changed and child items for the correct attachment have been requested
		expect(requestedAttachmentChildItems).toBe(true);
		expect(history.location.pathname).toBe('/testuser/items/KBFTPTI4/attachment/N2PJUHD6/reader');

		const iframe = container.querySelector('iframe');
		let readerConfig;
		const mockReader = {
			setAnnotations: jest.fn(),
			unsetAnnotations: jest.fn()
		};

		iframe.contentWindow.createReader = (_rc) => {
			readerConfig = _rc;
			return mockReader;
		}
		fireEvent(iframe, new Event('load', { bubbles: false, cancelable: false }));
		await act(() => readerConfig.onSaveAnnotations([noteAnnotation]));
		await waitForPosition();
		expect(requestedTpl).toBe(true);
		expect(postedAnnotation).toBe(true);
	});

	test('Update item that server is still creating', async () => {
		let hasRequestedTpl = false;
		let postCounter = 0;
		let firstRequestFired = false;
		server.use(
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('annotation');
				expect(url.searchParams.get('annotationType')).toBe('note');
				hasRequestedTpl = true;
				return HttpResponse.json(newItemAnnotationNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].key).toBe('Z1Z2Z3Z4');

				if (!firstRequestFired) {
					expect(items[0].itemType).toBe('annotation');
					expect(items[0].parentItem).toBe('N2PJUHD6');
					expect(items[0].annotationType).toBe('note');
					expect(items[0].annotationComment).toBe('hello note annotation');
					// set `firstRequestFired = true` before the delay so that we can start the second request while this one is still pending
					firstRequestFired = true;
				} else {
					expect(request.headers.get('If-Unmodified-Since-Version')).toBe('12345');
					expect(items[0].annotationComment).toBe('updated note annotation');
				}
				await delay(100);
				return HttpResponse.json(testUserCreateAnnotation, {
					headers: { 'Last-Modified-Version': 12345 + postCounter++ }
				});
			})
		)
		const { container } = renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitFor(() => expect(container.querySelector('iframe')).toBeInTheDocument(), { timeout: 3000 });
		const iframe = container.querySelector('iframe');
		let readerConfig;

		const mockReader = {
			setAnnotations: jest.fn(),
			unsetAnnotations: jest.fn()
		};

		iframe.contentWindow.createReader = (_rc) => {
			readerConfig = _rc;
			return mockReader;
		}
		fireEvent(iframe, new Event('load', { bubbles: false, cancelable: false }));
		await act(() => readerConfig.onSaveAnnotations([noteAnnotation]));
		await waitForPosition();
		expect(hasRequestedTpl).toBe(true);
		await waitFor(() => expect(firstRequestFired).toBe(true));
		// At this point first request (`createItems`) has not finished yet. We start the second request (`updateMultipleItems`) while the first one is still pending
		// This should delay the second request until the first one is finished, instead of spawning another `createItems` request
		await act(() => readerConfig.onSaveAnnotations([{ ...noteAnnotation, comment: 'updated note annotation' }]));
		await waitForPosition();
		await waitFor(() => expect(postCounter).toBe(2));
	});
});

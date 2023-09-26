/*
* @jest-environment ./test/utils/zotero-env.js
*/
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { act, waitFor, fireEvent } from '@testing-library/react';

import { renderWithProviders } from './utils/render';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import { JSONtoState } from './utils/state';
import stateRaw from './fixtures/state/test-user-reader-view.json';
import newItemAnnotationNote from "./fixtures/response/new-item-annotation-note.json";
import testUserCreateAnnotation from "./fixtures/response/test-user-create-annotation.json";

jest.mock('../src/js/common/pdf-worker.js');

const state = JSONtoState(stateRaw);
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
		rest.get('https://api.zotero.org/users/1/items/N2PJUHD6/file/view/url', (req, res) => {
			return res(res => {
				res.body = 'https://files.zotero.net/some-file-attachment.pdf';
				return res;
			});
		}),
		rest.get('https://files.zotero.net/some-file-attachment.pdf', (req, res) => {
			return res(res => {
				res.body = '';
				return res;
			});
		})
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

	test('Update item that server is still creating', async () => {
		let hasRequestedTpl = false;
		let postCounter = 0;
		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				expect(req.url.searchParams.get('itemType')).toBe('annotation');
				expect(req.url.searchParams.get('annotationType')).toBe('note');
				hasRequestedTpl = true;
				return res(res => {
					res.body = JSON.stringify(newItemAnnotationNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('Z1Z2Z3Z4');

				if(postCounter == 0) {
					expect(req.headers.get('If-Unmodified-Since-Version')).toBe('292');
					expect(items[0].itemType).toBe('annotation');
					expect(items[0].parentItem).toBe('N2PJUHD6');
					expect(items[0].annotationType).toBe('note');
					expect(items[0].annotationComment).toBe('hello note annotation');
				} else {
					expect(req.headers.get('If-Unmodified-Since-Version')).toBe('12345');
					expect(items[0].annotationComment).toBe('updated note annotation');
				}

				return res(res => {
					res.delay = 100;
					res.headers.set('Last-Modified-Version', 12345 + postCounter++);
					res.body = JSON.stringify(testUserCreateAnnotation);
					return res;
				});
			})
		)
		const { container } = renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitFor(() => expect(container.querySelector('iframe')).toBeInTheDocument(), { timeout: 3000 });
		const iframe = container.querySelector('iframe');
		let readerConfig;

		iframe.contentWindow.createReader = (_rc) => {
			readerConfig = _rc;
		}
		fireEvent(iframe, new Event('load', { bubbles: false, cancelable: false }));
		await act(() => readerConfig.onSaveAnnotations([noteAnnotation]));
		await waitForPosition();
		expect(hasRequestedTpl).toBe(true);
		await waitFor(() => expect(postCounter).toBe(1));
		await act(() => readerConfig.onSaveAnnotations([{ ...noteAnnotation, comment: 'updated note annotation' }]));
		await waitForPosition();
		await waitFor(() => expect(postCounter).toBe(2));
	});
});

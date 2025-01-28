/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node';
import { getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { PDFWorker } from '../src/js/common/pdf-worker.js';

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-top-level-attachment-view.json';
import searchByIdentifier from './fixtures/response/search-by-identifier-recognize.json';
import responseAddByIdentifier from './fixtures/response/test-user-add-by-identifier-recognize.json';

const mockedGetRecognizerData = jest.fn().mockReturnValue({
	filename: 'attention-is-all-you-need.pdf',
	metadata: {},
	// must pretend to have at least one word on page, otherwise pdf worker will skip recognition
	pages: [[612, 792, [[[[[0, 0, 0, 0, [[[[124.666, 74.1802, 167.6569, 84.5453, 11.9552, 1, 81.963, 0, 0, 0, 0, 0, 0, "Provided"]]]]]]]]]]],
	totalPages: 15
});

jest.mock('../src/js/common/pdf-worker.js');


const state = JSONtoState(stateRaw);

describe('Metadata Retrieval', () => {
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
		window.location = new URL('http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4');
	});

	afterEach(() => {
		server.resetHandlers();
		mockedGetRecognizerData.mockClear();
	});
	afterAll(() => server.close());

	test('', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasPostedToRecognizeService = false;
		let hasBeenSearched = false;
		let hasCreatedParentItem = false;
		let hasPatchedAttachmentItem = false;
		let hasDeleted = false;
		let patchCounter = 0;
		let version = state.libraries.u1.sync.version;

		server.use(
			http.post('https://recognizer.zotero.org/recognize', async ({ request }) => {
				const inputData = await request.json();
				expect(inputData.fileName).toBe('attention-is-all-you-need.pdf');
				expect(inputData.totalPages).toBe(15);
				hasPostedToRecognizeService = true;
				await delay(100);
				return HttpResponse.json({
					"type": "journal-article",
					"authors": [],
					"arxiv": "1706.03762",
				});
			}),
			http.post('https://translate-server.zotero.org/Prod/search', async ({ request }) => {
				const identifier = await request.text();
				expect(identifier).toMatch(/arxiv:\s+1706.03762/i);
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
				if (patchCounter === 0) {
					expect(item.parentItem).toBe('S8CIV6VJ');
					expect(item.collections).toEqual([]);
				} else {
					expect(item.parentItem).toBeNull();
					expect(item.collections).toEqual(['CSB4KZUU']);
				}
				hasPatchedAttachmentItem = true;
				version++;
				patchCounter++;
				await delay(100);
				return new HttpResponse(null, { status: 204, headers: { 'Last-Modified-Version': version } });
			}),
			http.delete('https://api.zotero.org/users/1/items/S8CIV6VJ', async () => {
				hasDeleted = true;
				version++;
				await delay(100);
				return new HttpResponse(null, { status: 204, headers: { 'Last-Modified-Version': version } });
			})
		);

		PDFWorker.mockImplementation(() => {
			return { getRecognizerData: mockedGetRecognizerData };
		});

		expect(screen.getByRole('row', { name: 'attention-is-all-you-need.pdf' }) ).toHaveAttribute('aria-selected', 'true');
		const recognizeBtn = screen.getByRole('button',
			{ name: 'Retrieve Metadata' }
		);
		await user.click(recognizeBtn);
		const dialog = screen.getByRole('dialog', { name: 'Metadata Retrieval' });
		const row = screen.getByRole('row', { name: 'attention-is-all-you-need.pdf' });
		getByRole(row, 'status', { name: 'Processing' });

		expect(
			getByRole(dialog, 'progressbar', { name: 'Metadata retrieval progress' })
		).toHaveAttribute('aria-valuenow', '0');

		// Progress is 25% after PDFWorker.getRecognizerData returns data extracted from the PDF
		await waitFor(() => {
			expect(
				getByRole(dialog, 'progressbar', { name: 'Metadata retrieval progress' })
			).toHaveAttribute('aria-valuenow', '25');
		});
		expect(mockedGetRecognizerData).toHaveBeenCalledTimes(1);

		// Progress is 50% after the recognizer server returns data
		await waitFor(() => {
			expect(
				getByRole(dialog, 'progressbar', { name: 'Metadata retrieval progress' })
			).toHaveAttribute('aria-valuenow', '50');
		});
		expect(hasPostedToRecognizeService).toBe(true);

		// Progress is 75% after the translation server returns an item for the identifier
		await waitFor(() => {
			expect(
				getByRole(dialog, 'progressbar', { name: 'Metadata retrieval progress' })
			).toHaveAttribute('aria-valuenow', '75');
		});
		expect(hasBeenSearched).toBe(true);

		// Progress is 100% after the item is created
		await waitFor(() => {
			expect(
				getByRole(dialog, 'progressbar', { name: 'Metadata retrieval progress' })
			).toHaveAttribute('aria-valuenow', '100');
		});
		getByRole(row, 'status', { name: 'Completed' });
		expect(hasCreatedParentItem).toBe(true);
		expect(hasPatchedAttachmentItem).toBe(true);

		await user.click(screen.getByRole('button', { name: 'Close Dialog' }));
		expect(await screen.findByRole('row', { name: 'Attention Is All You Need' })).toBeInTheDocument();
		expect(screen.queryByRole('row', { name: 'attention-is-all-you-need.pdf' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('row', { name: 'Attention Is All You Need' }));

		// unregonize
		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });
		await user.click(getByRole(toolbar, 'button', { name: 'More' }));
		await waitForPosition();
		await user.click(screen.getByRole('menuitem', { name: 'Undo Retrieve Metadata' }));

		await waitFor(() => {
			expect(screen.getByRole('row', { name: 'attention-is-all-you-need.pdf' })).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(screen.queryByRole('row', { name: 'Attention Is All You Need' })).not.toBeInTheDocument();
		});
		expect(hasDeleted).toBe(true);
	});
});

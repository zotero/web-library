/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getAllByRole, getByRole, findByRole, screen, waitFor, queryByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { makeSuccessResponse } from './utils/response';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-trash-view.json';

const state = JSONtoState(stateRaw);

describe('Trash', () => {
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
		window.location = new URL('http://localhost/testuser/trash');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Lists and counts items and collections in trash', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(2);
		expect(screen.getByText('2 objects in this view')).toBeInTheDocument();
	});

	test("Info view should be displayed when a collection is selected", async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');
		await user.click(getByRole(gridBody, 'row', { name: 'Trashed Collection' }));

		await waitFor(() => expect(screen.getByText('1 collection selected')).toBeInTheDocument());

		await user.keyboard('[OSLeft>][ControlRight>]');
		await user.click(getByRole(gridBody, 'row', { name: 'How to Tell If Your Cat Is Plotting to Kill You' }));
		await user.keyboard('[/OSLeft>][/ControlRight]');
		await waitForPosition();

		await waitFor(() => expect(screen.getByText('2 objects selected')).toBeInTheDocument());
	});

	test('Trashing a collection causes it to appear in the trash', async () => {
		const libVer = state.libraries.u1.sync.version;
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		server.use(
			http.post('https://api.zotero.org/users/1/collections', async ({ request }) => {
				const collections = await request.json();
				expect(collections[0].deleted).toBe(1);
				expect(collections[0].key).toBe('CSB4KZUU');
				hasBeenTrashed = true;
				const responseBody = { success: { "0": 'CSB4KZUU' }, successful: { "0": { key: 'CSB4KZUU', version: libVer, data: { ...state.libraries.u1.dataObjects.CSB4KZUU, deleted: 1 } } } };
				return HttpResponse.json(responseBody);
			}),
		);

		const collectionTreeItem = screen.getByRole('treeitem', { name: 'Algorithms' });
		await user.click(getByRole(collectionTreeItem, 'button', { name: 'More' }));
		const deleteOpt = await findByRole(collectionTreeItem, 'menuitem', { name: 'Delete' });

		let hasBeenTrashed = false;
		await user.click(deleteOpt);
		await waitFor(() => expect(screen.queryByRole('treeitem', { name: 'Algorithms' })).not.toBeInTheDocument());
		expect(hasBeenTrashed).toBe(true);

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');
		expect(getByRole(gridBody, 'row', { name: 'Algorithms' })).toBeInTheDocument();
		expect(screen.getByText('3 objects in this view')).toBeInTheDocument();
	});

	test('Recovering both items and collections from trash', async () => {
		let collectionsRecovered = false;
		let itemsRecovered = false;
		let nextVersion = state.libraries.u1.sync.version + 1;
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		server.use(
			http.post('https://api.zotero.org/users/1/collections', async ({ request }) => {
				const collections = await request.json();
				expect(collections[0].deleted).toBe(0);
				expect(collections[0].key).toBe('Z7B4P73I');
				collectionsRecovered = true;
				const responseBody = makeSuccessResponse(collections.map(c => c.key), state.libraries.u1.dataObjects, ++nextVersion, { deleted: 0 });
				return HttpResponse.json(responseBody);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				expect(items[0].deleted).toBe(0);
				expect(items[0].key).toBe('BPM2IS2N');
				itemsRecovered = true;
				const responseBody = makeSuccessResponse(items.map(i => i.key), state.libraries.u1.dataObjects, ++nextVersion, { deleted: 0 });
				return HttpResponse.json(responseBody);
			})
		);

		expect(screen.queryByRole('treeitem', { name: 'Trashed Collection' })).not.toBeInTheDocument();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');
		await user.keyboard('[OSLeft>][ControlRight>]');
		await user.click(getByRole(gridBody, 'row', { name: 'Trashed Collection' }));
		await user.click(getByRole(gridBody, 'row', { name: 'How to Tell If Your Cat Is Plotting to Kill You' }));
		await user.keyboard('[/OSLeft>][/ControlRight]');

		await waitForPosition();
		expect(getByRole(gridBody, 'row', { name: 'Trashed Collection' })).toHaveAttribute('aria-selected', 'true');
		expect(getByRole(gridBody, 'row', { name: 'How to Tell If Your Cat Is Plotting to Kill You' })).toHaveAttribute('aria-selected', 'true');

		await user.click(await screen.findByRole('button', { name: 'Restore to Library' }));

		await waitFor(() => expect(queryByRole(gridBody, 'row')).not.toBeInTheDocument());
		expect(screen.getByText('No items in this view')).toBeInTheDocument();
		expect(screen.getByRole('treeitem', { name: 'Trashed Collection' })).toBeInTheDocument();
		expect(collectionsRecovered).toBe(true);
		expect(itemsRecovered).toBe(true);
	});

	test('Collections are trashed and deleted recursively, but only the parent collection appears in the trash', async () => {
		const libVer = state.libraries.u1.sync.version;
		const user = userEvent.setup();
		let requestCounter = 0;
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		server.use(
			http.post('https://api.zotero.org/users/1/collections', async ({ request }) => {
				const collections = await request.json();
				expect(collections.length).toBe(3);
				expect(collections.every(c => c.deleted)).toBe(true);
				hasBeenTrashed = true;
				const responseBody = makeSuccessResponse(collections.map(c => c.key), state.libraries.u1.dataObjects, libVer, { deleted: 1 });
				requestCounter++;
				return HttpResponse.json(responseBody);
			}),
		);

		const collectionTreeItem = screen.getByRole('treeitem', { name: 'Dogs' });
		await user.click(getByRole(collectionTreeItem, 'button', { name: 'More' }));
		const deleteOpt = await findByRole(collectionTreeItem, 'menuitem', { name: 'Delete' });

		let hasBeenTrashed = false;
		await user.click(deleteOpt);
		await waitFor(() => expect(screen.queryByRole('treeitem', { name: 'Dogs' })).not.toBeInTheDocument());
		expect(hasBeenTrashed).toBe(true);

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');
		expect(getByRole(gridBody, 'row', { name: 'Dogs' })).toBeInTheDocument();
		expect(screen.getByText('3 objects in this view')).toBeInTheDocument();
		expect(requestCounter).toBe(1);

		server.use(
			http.delete('https://api.zotero.org/users/1/collections', async ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('collectionKey').split(',')).toEqual(expect.arrayContaining(['WTTJ2J56', 'HNLXYCXS', '9WZDZ7YA']));
				requestCounter++;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		await user.click(getByRole(gridBody, 'row', { name: 'Dogs' }));
		await user.click(await screen.findByRole('button', { name: 'Delete Permanently'}));
		await waitFor(() => expect(screen.queryByRole('row', { name: 'Dogs' })).not.toBeInTheDocument());
		expect(screen.getByText('2 objects in this view')).toBeInTheDocument();
		expect(requestCounter).toBe(2);
	});
});

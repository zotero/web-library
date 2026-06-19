/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '../src/js/store';
import { JSONtoState } from './utils/state';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import { makeSuccessResponse } from './utils/response';
import { chunkedDeleteCollections, chunkedUpdateCollectionsTrash } from '../src/js/actions/collections';
import stateRaw from './fixtures/state/desktop-test-user-trash-view.json';

const makeCollection = (key, parentCollection, deleted) => ({
	key,
	version: 1,
	name: `Collection ${key}`,
	parentCollection,
	relations: {},
	deleted,
	[Symbol.for('type')]: 'collection',
});

// Builds 50 top-level collections + 1 nested under the first one (51 total)
const setupCollections = (deleted) => {
	const topLevelKeys = Array.from(
		{ length: 50 },
		(_, i) => `TOPCL${i.toString().padStart(3, '0')}`
	);
	const nestedKey = 'NESTED01';
	const parentKey = topLevelKeys[0];

	const dataObjects = {};
	topLevelKeys.forEach(key => {
		dataObjects[key] = makeCollection(key, false, deleted);
	});
	dataObjects[nestedKey] = makeCollection(nestedKey, parentKey, deleted);

	const allCollectionKeys = [...topLevelKeys, nestedKey];

	const baseState = JSONtoState(stateRaw);
	const preloadedState = {
		...baseState,
		libraries: {
			...baseState.libraries,
			u1: {
				...baseState.libraries.u1,
				collections: {
					...baseState.libraries.u1.collections,
					keys: allCollectionKeys,
					totalResults: allCollectionKeys.length,
				},
				dataObjects: {
					...baseState.libraries.u1.dataObjects,
					...dataObjects,
				},
			},
		},
	};

	return { allCollectionKeys, preloadedState };
};

describe('Batched collection operations are split into chunks of 50', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	setupMSWLifecycle(server);

	test('51 trashed collections are permanently deleted as two batches of 50 and 1', async () => {
		const { allCollectionKeys, preloadedState } = setupCollections(true);
		expect(allCollectionKeys).toHaveLength(51);

		// Record the number of collection keys sent in each DELETE request.
		const batches = [];
		server.use(
			http.delete('https://api.zotero.org/users/1/collections', ({ request }) => {
				const url = new URL(request.url);
				batches.push(url.searchParams.get('collectionKey').split(',').length);
				return new HttpResponse(null, { status: 204 });
			})
		);

		const store = setupStore(preloadedState);

		// Trigger permanent deletion of all 51 collections. This is the same call
		// `currentDeletePermanently` issues for the collections in the selection.
		await store.dispatch(chunkedDeleteCollections(allCollectionKeys, 'u1'));

		// Collections must be split into two batches: 50, then 1.
		expect(batches).toHaveLength(2);
		expect(batches[0]).toBe(50);
	});

	test('51 collections are moved to trash as two batches of 50 and 1', async () => {
		const { allCollectionKeys, preloadedState } = setupCollections(false);
		expect(allCollectionKeys).toHaveLength(51);

		// Record the number of collection keys sent in each POST request.
		const batches = [];
		const version = preloadedState.libraries.u1.sync.version;
		server.use(
			http.post('https://api.zotero.org/users/1/collections', async ({ request }) => {
				const body = await request.json();
				batches.push(body.length);
				return HttpResponse.json(
					makeSuccessResponse(body.map(c => c.key), preloadedState.libraries.u1.dataObjects, version, { deleted: 1 })
				);
			})
		);

		const store = setupStore(preloadedState);

		// Trigger trashing of all 51 collections. This is the same call
		// `currentMoveToTrash` issues for the collections in the selection.
		await store.dispatch(chunkedUpdateCollectionsTrash(allCollectionKeys, 'u1', 1));

		// Collections must be split into two batches: 50, then 1.
		expect(batches).toHaveLength(2);
		expect(batches[0]).toBe(50);
	});
});

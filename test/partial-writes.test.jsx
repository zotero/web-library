/*
* @jest-environment ./test/utils/zotero-env.js
*/

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { getPachtedStateMultiple, JSONtoState } from './utils/state';
import { setupStore } from '../src/js/store';
import { addToCollection, createItems, moveItemsToTrash, recoverItemsFromTrash, removeFromCollection,
	updateMultipleItems } from '../src/js/actions/items-write';
import { chunkedUpdateCollectionsTrash } from '../src/js/actions/collections';
import { PartialWriteError } from '../src/js/common/actions';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';

// Writes every posted object except the one at `failedIndex`
const partialWriteHandler = (url, failedIndex) => http.post(url, async ({ request }) => {
	const objects = await request.json();
	const result = { successful: {}, success: {}, unchanged: {}, failed: {} };
	objects.forEach((object, index) => {
		if(index === failedIndex) {
			result.failed[index] = { key: object.key, code: 400, message: 'Test failure' };
			return;
		}
		const key = object.key ?? `NEWITEM${index}`;
		result.successful[index] = { key, version: 411, data: { ...object, key, version: 411 } };
		result.success[index] = key;
	});
	return HttpResponse.json(result, { headers: { 'Last-Modified-Version': '411' } });
});

const itemsUrl = 'https://api.zotero.org/users/1/items';
const collectionsUrl = 'https://api.zotero.org/users/1/collections';

const expectRequestEndedWithPartialError = store => {
	const { libraries, errors } = store.getState();
	// a request that ended with both RECEIVE_ and ERROR_ would leave this at -1
	expect(libraries.u1.sync.requestsPending).toBe(0);
	expect(errors[0].message).toBe('Some updates failed.');
};

describe('Partial writes', () => {
	const server = setupServer();
	setupMSWLifecycle(server);

	test('Create Items receives the items that were created', async () => {
		const store = setupStore(JSONtoState(stateRaw));
		server.use(partialWriteHandler(itemsUrl, 1));

		await expect(store.dispatch(createItems([
			{ itemType: 'book', title: 'Created' },
			{ itemType: 'book', title: 'Not created' },
		], 'u1'))).rejects.toBeInstanceOf(PartialWriteError);

		const items = store.getState().libraries.u1.items;
		expect(items.NEWITEM0.title).toBe('Created');
		expect(Object.values(items).map(i => i.title)).not.toContain('Not created');
		expect(items).not.toHaveProperty('undefined');
		expectRequestEndedWithPartialError(store);
	});

	test('Update Multiple Items receives the items that were updated', async () => {
		const store = setupStore(JSONtoState(stateRaw));
		// the first object fails so that written items and their patches only line up if failed patches are left out
		server.use(partialWriteHandler(itemsUrl, 0));

		await expect(store.dispatch(updateMultipleItems([
			{ key: 'VR82JUX8', collections: [] },
			{ key: 'HHVQTHFT', collections: [] },
		], 'u1'))).rejects.toBeInstanceOf(PartialWriteError);

		const { items, itemsByCollection } = store.getState().libraries.u1;
		expect(items.VR82JUX8.collections).toEqual(['WTTJ2J56']);
		expect(items.HHVQTHFT.collections).toEqual([]);
		expect(itemsByCollection.WTTJ2J56.keys).toContain('VR82JUX8');
		expect(itemsByCollection.WTTJ2J56.keys).not.toContain('HHVQTHFT');
		expectRequestEndedWithPartialError(store);
	});

	test('Move to Trash receives the items that were trashed', async () => {
		const store = setupStore(JSONtoState(stateRaw));
		server.use(partialWriteHandler(itemsUrl, 1));

		await expect(store.dispatch(moveItemsToTrash(['VR82JUX8', 'HHVQTHFT'])))
			.rejects.toBeInstanceOf(PartialWriteError);

		const items = store.getState().libraries.u1.items;
		expect(items.VR82JUX8.deleted).toBe(1);
		expect(items.HHVQTHFT.deleted).toBeFalsy();
		expectRequestEndedWithPartialError(store);
	});

	test('Restore to Library receives the items that were restored', async () => {
		const trashedState = getPachtedStateMultiple(JSONtoState(stateRaw), [
			['libraries.u1.items.VR82JUX8', { deleted: 1 }],
			['libraries.u1.items.HHVQTHFT', { deleted: 1 }],
			['libraries.u1.dataObjects.VR82JUX8', { deleted: 1 }],
			['libraries.u1.dataObjects.HHVQTHFT', { deleted: 1 }],
		]);
		const store = setupStore(trashedState);
		server.use(partialWriteHandler(itemsUrl, 1));

		await expect(store.dispatch(recoverItemsFromTrash(['VR82JUX8', 'HHVQTHFT'])))
			.rejects.toBeInstanceOf(PartialWriteError);

		const items = store.getState().libraries.u1.items;
		expect(items.VR82JUX8.deleted).toBe(0);
		expect(items.HHVQTHFT.deleted).toBe(1);
		expectRequestEndedWithPartialError(store);
	});

	test('Add to Collection receives the items that were added', async () => {
		const store = setupStore(JSONtoState(stateRaw));
		server.use(partialWriteHandler(itemsUrl, 1));

		await expect(store.dispatch(addToCollection(['VR82JUX8', 'HHVQTHFT'], 'SGQRGR2J')))
			.rejects.toBeInstanceOf(PartialWriteError);

		const items = store.getState().libraries.u1.items;
		expect(items.VR82JUX8.collections).toEqual(['WTTJ2J56', 'SGQRGR2J']);
		expect(items.HHVQTHFT.collections).toEqual(['WTTJ2J56']);
		expectRequestEndedWithPartialError(store);
	});

	test('Remove from Collection receives the items that were removed', async () => {
		const store = setupStore(JSONtoState(stateRaw));
		server.use(partialWriteHandler(itemsUrl, 1));

		await expect(store.dispatch(removeFromCollection(['VR82JUX8', 'HHVQTHFT'], 'WTTJ2J56')))
			.rejects.toBeInstanceOf(PartialWriteError);

		const { items, itemsByCollection } = store.getState().libraries.u1;
		expect(items.VR82JUX8.collections).toEqual([]);
		expect(items.HHVQTHFT.collections).toEqual(['WTTJ2J56']);
		expect(itemsByCollection.WTTJ2J56.keys).not.toContain('VR82JUX8');
		expect(itemsByCollection.WTTJ2J56.keys).toContain('HHVQTHFT');
		expectRequestEndedWithPartialError(store);
	});

	test('Move collections to Trash receives the collections that were trashed', async () => {
		const store = setupStore(JSONtoState(stateRaw));
		server.use(partialWriteHandler(collectionsUrl, 1));

		await expect(store.dispatch(chunkedUpdateCollectionsTrash(['SGQRGR2J', 'I6WUED2Y'], 'u1', 1)))
			.rejects.toBeInstanceOf(PartialWriteError);

		const dataObjects = store.getState().libraries.u1.dataObjects;
		expect(dataObjects.SGQRGR2J.deleted).toBe(1);
		expect(dataObjects.I6WUED2Y.deleted).toBeFalsy();
		expectRequestEndedWithPartialError(store);
	});
});

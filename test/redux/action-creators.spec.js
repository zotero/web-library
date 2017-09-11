'use strict';

const assert = require('chai').assert;
const cede = require('../helper/cede');
const configureStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const ReduxAsyncQueue = require('redux-async-queue').default;
const fetchMock = require('fetch-mock');
const FakeStore = require('../helper/fake-store.js');
if(typeof window === 'undefined') {
	global.window = { localStorage: new FakeStore() };
}
const { 
	initialize,
	fetchCollections,
	fetchItems,
	updateItem,
	fetchItemTypeFields,
	fetchItemTypeCreatorTypes,
	fetchChildItems
} = require('../../src/js/actions.js');
const { 
	REQUEST_META,
	RECEIVE_META,
	ERROR_META,
	REQUEST_COLLECTIONS_IN_LIBRARY,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	ERROR_COLLECTIONS_IN_LIBRARY,
	REQUEST_ITEMS_IN_COLLECTION,
	RECEIVE_ITEMS_IN_COLLECTION,
	ERROR_ITEMS_IN_COLLECTION,
	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
} = require('../../src/js/constants/actions.js');

const collectionsFixture = require('../fixtures/collections.json');
const itemsFixture = require('../fixtures/items-top.json');
const creatorTypesFixture = require('../fixtures/item-types-creator-types.json');
const fieldsFixture = require('../fixtures/item-types-fields.json');

const mockStore = configureStore([thunk, ReduxAsyncQueue]);
const initialState = {
	config: {
		apiKey: 'API_KEY'
	}
};

describe('action creators', () => {
	beforeEach(() => {
		window.localStorage.clear();
	});
	afterEach(fetchMock.restore);

	it('initialize', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemTypes\??.*/, ['a']);
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemFields\??.*/, ['b']);
		fetchMock.mock(/https:\/\/api\.zotero\.org\/creatorFields\??.*/, ['c']);
		const store = mockStore(initialState);
		const action = initialize();
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_META);
		assert.strictEqual(store.getActions()[1].type,RECEIVE_META);
		assert.sameMembers(store.getActions()[1].itemTypes, ['a']);
		assert.sameMembers(store.getActions()[1].itemFields, ['b']);
		assert.sameMembers(store.getActions()[1].creatorFields, ['c']);
	});

	it('initialize error', async () => {
		fetchMock.mock('begin:https://api.zotero.org/', { status: 500 });
		const store = mockStore(initialState);
		const action = initialize();

		try {
			await store.dispatch(action);
			fail('Expected to throw an error');
		} catch(error) {
			assert.equal(error.message, '500: Internal Server Error');
		}
		
		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_META);
		assert.strictEqual(store.getActions()[1].type,ERROR_META);
		assert.equal(store.getActions()[1].error.message, '500: Internal Server Error');
	});

	it('fetchCollections', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123456\/collections\??.*/, collectionsFixture);
		const store = mockStore(initialState);
		const action = fetchCollections('u123456');
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_COLLECTIONS_IN_LIBRARY);
		assert.strictEqual(store.getActions()[1].type,RECEIVE_COLLECTIONS_IN_LIBRARY);
		const collectionNamesInOrder = [
			'Test Collection A',
			'Test Collection A1',
			'Test Collection B',
			'Test Collection C'
		];
		assert.sameOrderedMembers(store.getActions()[1].collections.map(c => c.name), collectionNamesInOrder);
	});

	it('fetchCollections error', async () => {
		fetchMock.mock('begin:https://api.zotero.org/', { status: 500 });
		const store = mockStore(initialState);
		const action = fetchCollections('u123456');
		
		try {
			await store.dispatch(action);
			fail('Expected to throw an error');
		} catch(error) {
			assert.equal(error.message, '500: Internal Server Error');
		}

		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_COLLECTIONS_IN_LIBRARY);
		assert.strictEqual(store.getActions()[1].type,ERROR_COLLECTIONS_IN_LIBRARY);
		assert.equal(store.getActions()[1].error.message, '500: Internal Server Error');
	});

	it('fetchItems', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123456\/collections\/AAAAAAAA\??.*/, itemsFixture);
		const store = mockStore({
			...initialState,
			library: {
				libraryKey: 'u123456'
			}
		});
		const action = fetchItems('AAAAAAAA');
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_ITEMS_IN_COLLECTION);
		assert.equal(store.getActions()[0].libraryKey, 'u123456');
		assert.equal(store.getActions()[0].collectionKey, 'AAAAAAAA');
		assert.strictEqual(store.getActions()[1].type,RECEIVE_ITEMS_IN_COLLECTION);
		assert.equal(store.getActions()[1].libraryKey, 'u123456');
		assert.equal(store.getActions()[1].collectionKey, 'AAAAAAAA');
		const itemTitlesInOrder = [
			'document-1',
			'document-2'
		];
		assert.sameOrderedMembers(store.getActions()[1].items.map(c => c.title), itemTitlesInOrder);
	});

	it('fetchItems error', async () => {
		fetchMock.mock('begin:https://api.zotero.org/', { status: 500 });
		const store = mockStore({
			...initialState,
			library: {
				libraryKey: 'u123456'
			}
		});
		const action = fetchItems('AAAAAAAA'); 
		
		try {
			await store.dispatch(action);
			fail('Expected to throw an error');
		} catch(error) {
			assert.equal(error.message, '500: Internal Server Error');
		}

		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_ITEMS_IN_COLLECTION);
		assert.strictEqual(store.getActions()[1].type,ERROR_ITEMS_IN_COLLECTION);
		assert.equal(store.getActions()[1].error.message, '500: Internal Server Error');
	});

	it('updateItem', async () => {
		fetchMock.mock((url, opts) => {
				assert(url.match(/https:\/\/api\.zotero\.org\/users\/123\/items\/ITEM1111\??.*/));
				assert(opts.method, 'patch');
				assert(opts.body, {
					title: 'foobar'
				});
				return true;
			}, {
			headers: {
				'Last-Modified-Version': 1337
			},
			body: {
				title: 'foobar'
			}
		});

		const store = mockStore({
			config: {
				apiKey: 'API_KEY'
			},
			library: 'u123',
			items: {
				ITEM1111u123: {
					key: 'ITEM1111',
					version: 1,
					title: 'foo',
					collections: ['AAAAAAAA']
				}
			}
		});

		const action = updateItem('u123', 'ITEM1111', { title: 'foobar' });
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length,1);
		assert.strictEqual(store.getActions()[0].type,REQUEST_UPDATE_ITEM);
		assert.strictEqual(store.getActions()[0].itemKey, 'ITEM1111');
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.deepEqual(store.getActions()[0].patch, { title: 'foobar'});

		await cede(); // allow async-queue process this request
		
		assert.strictEqual(store.getActions()[1].type, RECEIVE_UPDATE_ITEM);
		assert.strictEqual(store.getActions()[1].item.title, 'foobar');
		assert.strictEqual(store.getActions()[1].item.version, 1337);

	});

	it('fetchItemTypeFields', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemTypeFields\?.*?itemType=book.*?/, fieldsFixture);
		const store = mockStore(initialState);
		await store.dispatch(fetchItemTypeFields('book'));

		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].itemType, 'book');
		assert.deepEqual(store.getActions()[1].fields, fieldsFixture);
	});

	it('fetchItemTypeCreatorTypes', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemTypeCreatorTypes\?.*?itemType=book.*?/, creatorTypesFixture);
		const store = mockStore(initialState);
		await store.dispatch(fetchItemTypeCreatorTypes('book'));

		assert.strictEqual(store.getActions().length, 2);
		assert.strictEqual(store.getActions()[0].itemType, 'book');
		assert.deepEqual(store.getActions()[1].creatorTypes, creatorTypesFixture);
	});

	it('fetchChildItems', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123\/items\/ITEM0000\/children\??.*/, itemsFixture);
		const store = mockStore(initialState);
		await store.dispatch(fetchChildItems('ITEM0000', 'u123'));

		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type, REQUEST_CHILD_ITEMS);
		assert.strictEqual(store.getActions()[0].itemKey, 'ITEM0000');
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.strictEqual(store.getActions()[1].type, RECEIVE_CHILD_ITEMS);
		assert.strictEqual(store.getActions()[1].itemKey, 'ITEM0000');
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');
		assert.strictEqual(store.getActions()[1].childItems[0].key, 'ITEM2222');
		assert.strictEqual(store.getActions()[1].childItems[1].key, 'ITEM1111');
	});
});
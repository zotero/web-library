'use strict';

const configureStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const ReduxAsyncQueue = require('redux-async-queue').default;
const fetchMock = require('fetch-mock');
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
	ERROR_UPDATE_ITEM,
	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	ERROR_CHILD_ITEMS,
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
	afterEach(fetchMock.restore);

	it('initialize', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemTypes\??.*/, ['a']);
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemFields\??.*/, ['b']);
		fetchMock.mock(/https:\/\/api\.zotero\.org\/creatorFields\??.*/, ['c']);
		const store = mockStore(initialState);
		const action = initialize();
		await store.dispatch(action);
		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toBe(REQUEST_META);
		expect(store.getActions()[1].type).toBe(RECEIVE_META);
		expect(store.getActions()[1].itemTypes).toEqual(['a']);
		expect(store.getActions()[1].itemFields).toEqual(['b']);
		expect(store.getActions()[1].creatorFields).toEqual(['c']);
	});

	it('initialize error', async () => {
		fetchMock.mock('begin:https://api.zotero.org/', { status: 500 });
		const store = mockStore(initialState);
		const action = initialize();

		try {
			await store.dispatch(action);
			fail('Expected to throw an error');
		} catch(error) {
			expect(error.message).toEqual('500: Internal Server Error');
		}
		
		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toBe(REQUEST_META);
		expect(store.getActions()[1].type).toBe(ERROR_META);
		expect(store.getActions()[1].error.message).toEqual('500: Internal Server Error');
	});

	it('fetchCollections', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123456\/collections\??.*/, collectionsFixture);
		const store = mockStore(initialState);
		const action = fetchCollections('u123456');
		await store.dispatch(action);
		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toBe(REQUEST_COLLECTIONS_IN_LIBRARY);
		expect(store.getActions()[1].type).toBe(RECEIVE_COLLECTIONS_IN_LIBRARY);
		const collectionNamesInOrder = [
			'Test Collection A',
			'Test Collection A1',
			'Test Collection B',
			'Test Collection C'
		];
		expect(store.getActions()[1].collections.map(c => c.name)).toEqual(collectionNamesInOrder);
	});

	it('fetchCollections error', async () => {
		fetchMock.mock('begin:https://api.zotero.org/', { status: 500 });
		const store = mockStore(initialState);
		const action = fetchCollections('u123456');
		
		try {
			await store.dispatch(action);
			fail('Expected to throw an error');
		} catch(error) {
			expect(error.message).toEqual('500: Internal Server Error');
		}

		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toBe(REQUEST_COLLECTIONS_IN_LIBRARY);
		expect(store.getActions()[1].type).toBe(ERROR_COLLECTIONS_IN_LIBRARY);
		expect(store.getActions()[1].error.message).toEqual('500: Internal Server Error');
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
		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toBe(REQUEST_ITEMS_IN_COLLECTION);
		expect(store.getActions()[0].libraryKey).toEqual('u123456');
		expect(store.getActions()[0].collectionKey).toEqual('AAAAAAAA');
		expect(store.getActions()[1].type).toBe(RECEIVE_ITEMS_IN_COLLECTION);
		expect(store.getActions()[1].libraryKey).toEqual('u123456');
		expect(store.getActions()[1].collectionKey).toEqual('AAAAAAAA');
		const itemTitlesInOrder = [
			'document-1',
			'document-2'
		];
		expect(store.getActions()[1].items.map(c => c.title)).toEqual(itemTitlesInOrder);
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
			expect(error.message).toEqual('500: Internal Server Error');
		}

		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toBe(REQUEST_ITEMS_IN_COLLECTION);
		expect(store.getActions()[1].type).toBe(ERROR_ITEMS_IN_COLLECTION);
		expect(store.getActions()[1].error.message).toEqual('500: Internal Server Error');
	});

	it('updateItem', async () => {
		fetchMock.mock((url, opts) => {
				expect(url.match(/https:\/\/api\.zotero\.org\/users\/123456\/items\/ITEM1111\??.*/));
				expect(opts.method, 'patch');
				expect(opts.body, {
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
					title: 'foo'
				}
			}
		});

		const action = updateItem('u123', 'ITEM1111', { title: 'foobar' });
		await store.dispatch(action);
		expect(store.getActions().length).toBe(1);
		expect(store.getActions()[0].type).toBe(REQUEST_UPDATE_ITEM);
		expect(store.getActions()[0].itemKey).toEqual('ITEM1111');
		expect(store.getActions()[0].libraryKey).toEqual('u123');
		expect(store.getActions()[0].patch).toEqual({ title: 'foobar'});
		// expect(store.getActions()[1].type).toBe(RECEIVE_UPDATE_ITEM);
		// expect(store.getActions()[1].item.title).toEqual('foobar');
		// expect(store.getActions()[1].item.version).toEqual(1337);
	});

	it('fetchItemTypeFields', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemTypeFields\?.*?itemType=book.*?/, fieldsFixture);
		const store = mockStore(initialState);
		await store.dispatch(fetchItemTypeFields('book'));

		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].itemType).toEqual('book');
		expect(store.getActions()[1].fields).toEqual(fieldsFixture);
	});

	it('fetchItemTypeCreatorTypes', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/itemTypeCreatorTypes\?.*?itemType=book.*?/, creatorTypesFixture);
		const store = mockStore(initialState);
		await store.dispatch(fetchItemTypeCreatorTypes('book'));

		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].itemType).toEqual('book');
		expect(store.getActions()[1].creatorTypes).toEqual(creatorTypesFixture);
	});

	it('fetchChildItems', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123\/items\/ITEM0000\/children\??.*/, itemsFixture);
		const store = mockStore(initialState);
		await store.dispatch(fetchChildItems('ITEM0000', 'u123'));

		expect(store.getActions().length).toBe(2);
		expect(store.getActions()[0].type).toEqual(REQUEST_CHILD_ITEMS);
		expect(store.getActions()[0].itemKey).toEqual('ITEM0000');
		expect(store.getActions()[0].libraryKey).toEqual('u123');
		expect(store.getActions()[1].type).toEqual(RECEIVE_CHILD_ITEMS);
		expect(store.getActions()[1].itemKey).toEqual('ITEM0000');
		expect(store.getActions()[1].libraryKey).toEqual('u123');
		expect(store.getActions()[1].childItems[0].key).toEqual('ITEM2222');
		expect(store.getActions()[1].childItems[1].key).toEqual('ITEM1111');
	});
});
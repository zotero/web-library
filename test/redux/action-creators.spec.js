'use strict';

const assert = require('chai').assert;
const cede = require('../helper/cede');
const configureStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const ReduxAsyncQueue = require('redux-async-queue').default;
const fetchMock = require('fetch-mock');

const {
	addToCollection,
	createItem,
	fetchChildItems,
	fetchCollections,
	fetchItems,
	fetchItemsInCollection,
	fetchItemTypeCreatorTypes,
	fetchItemTypeFields,
	fetchTopItems,
	fetchTrashItems,
	initialize,
	moveToTrash,
	recoverFromTrash,
	updateItem,
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
	PRE_UPDATE_ITEM,
	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	REQUEST_FETCH_ITEMS,
	RECEIVE_FETCH_ITEMS,
	REQUEST_TOP_ITEMS,
	RECEIVE_TOP_ITEMS,
	REQUEST_TRASH_ITEMS,
	RECEIVE_TRASH_ITEMS,
	PRE_MOVE_ITEMS_TRASH,
	REQUEST_MOVE_ITEMS_TRASH,
	RECEIVE_MOVE_ITEMS_TRASH,
	PRE_RECOVER_ITEMS_TRASH,
	REQUEST_RECOVER_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	PRE_ADD_ITEMS_TO_COLLECTION,
	REQUEST_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
} = require('../../src/js/constants/actions.js');

const collectionsFixture = require('../fixtures/collections.json');
const itemsFixture = require('../fixtures/items-top.json');
const creatorTypesFixture = require('../fixtures/item-types-creator-types.json');
const fieldsFixture = require('../fixtures/item-types-fields.json');

const mockStore = configureStore([thunk, ReduxAsyncQueue]);
const initialState = {
	config: {
		apiKey: 'API_KEY'
	},
	current: {
		library: 'u123'
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
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/444\/collections\??.*/, collectionsFixture);
		const store = mockStore(initialState);
		const action = fetchCollections('u444');
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
		const action = fetchCollections('u444');

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

	it('fetchItemsInCollection', async () => {
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123\/collections\/AAAAAAAA\/items\/top\??.*/, itemsFixture);
		const store = mockStore(initialState);
		const action = fetchItemsInCollection('AAAAAAAA');
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type,REQUEST_ITEMS_IN_COLLECTION);
		assert.equal(store.getActions()[0].libraryKey, 'u123');
		assert.equal(store.getActions()[0].collectionKey, 'AAAAAAAA');
		assert.strictEqual(store.getActions()[1].type,RECEIVE_ITEMS_IN_COLLECTION);
		assert.equal(store.getActions()[1].libraryKey, 'u123');
		assert.equal(store.getActions()[1].collectionKey, 'AAAAAAAA');
		assert.deepEqual(store.getActions()[1].items, itemsFixture.map(i => i.data));

		assert.deepEqual(
			store.getActions()[1].items[0][Symbol.for('meta')],
			itemsFixture[0].meta
		);
	});

	it('fetchItemsInCollection error', async () => {
		fetchMock.mock('begin:https://api.zotero.org/', { status: 500 });
		const store = mockStore(initialState);
		const action = fetchItemsInCollection('AAAAAAAA');

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

	it('fetchItems', async () => {
		fetchMock.get(/https:\/\/api\.zotero\.org\/users\/123\/items\??.*/, itemsFixture);
		const store = mockStore(initialState);
		const action = fetchItems(['ITEM2222', 'ITEM1111', 'CHILD111', 'CHILD222']);
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type, REQUEST_FETCH_ITEMS);
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.deepEqual(store.getActions()[0].itemKeys, ['ITEM2222', 'ITEM1111', 'CHILD111', 'CHILD222']);
		assert.strictEqual(store.getActions()[1].type, RECEIVE_FETCH_ITEMS);
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');
		assert.deepEqual(store.getActions()[1].itemKeys, ['ITEM2222', 'ITEM1111', 'CHILD111', 'CHILD222']);
		assert.deepEqual(store.getActions()[1].items, itemsFixture.map(i => i.data));

		assert.deepEqual(
			store.getActions()[1].items[0][Symbol.for('meta')],
			itemsFixture[0].meta
		);
	});

	it('fetchTopItems', async () => {
		fetchMock.get(/https:\/\/api\.zotero\.org\/users\/123\/items\/top\??.*/, itemsFixture);
		const store = mockStore(initialState);
		const action = fetchTopItems();
		await store.dispatch(action);
		assert.strictEqual(store.getActions().length, 2);
		assert.strictEqual(store.getActions()[0].type, REQUEST_TOP_ITEMS);
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.strictEqual(store.getActions()[1].type, RECEIVE_TOP_ITEMS);
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');
		assert.deepEqual(store.getActions()[1].items, itemsFixture.map(i => i.data));

		assert.deepEqual(
			store.getActions()[1].items[0][Symbol.for('meta')],
			itemsFixture[0].meta
		);
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
			...initialState,
			libraries: {
				u123: {
					items: {
						'ITEM1111': {
							key: 'ITEM1111',
							version: 1,
							title: 'foo',
							collections: ['AAAAAAAA']
						}
					}
				}
			}
		});

		const action = updateItem('ITEM1111', { title: 'foobar' });
		await store.dispatch(action);
		assert.strictEqual(store.getActions()[0].type, PRE_UPDATE_ITEM);
		assert.strictEqual(store.getActions()[0].itemKey, 'ITEM1111');
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.deepEqual(store.getActions()[0].patch, { title: 'foobar'});

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[1].type,REQUEST_UPDATE_ITEM);
		assert.strictEqual(store.getActions()[1].itemKey, 'ITEM1111');
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');
		assert.deepEqual(store.getActions()[1].patch, { title: 'foobar'});

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[2].type, RECEIVE_UPDATE_ITEM);
		assert.strictEqual(store.getActions()[2].item.title, 'foobar');
		assert.strictEqual(store.getActions()[2].item.version, 1337);
		assert.typeOf(store.getActions()[2].response.response, 'object');
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
		await store.dispatch(fetchChildItems('ITEM0000'));

		assert.strictEqual(store.getActions().length,2);
		assert.strictEqual(store.getActions()[0].type, REQUEST_CHILD_ITEMS);
		assert.strictEqual(store.getActions()[0].itemKey, 'ITEM0000');
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.strictEqual(store.getActions()[1].type, RECEIVE_CHILD_ITEMS);
		assert.strictEqual(store.getActions()[1].itemKey, 'ITEM0000');
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');
		assert.strictEqual(store.getActions()[1].childItems[0].key, 'ITEM2222');
		assert.strictEqual(store.getActions()[1].childItems[1].key, 'ITEM1111');

		assert.deepEqual(
			store.getActions()[1].childItems[0][Symbol.for('meta')],
			itemsFixture[0].meta
		);
	});


	it('fetchTrashItems', async () => {
		const trashedItems = itemsFixture.map(item => ({
			data: {
				...item.data,
				deleted: 1
			},
			...item
		}));
		fetchMock.mock(/https:\/\/api\.zotero\.org\/users\/123\/items\/trash\??.*/, trashedItems);
		const store = mockStore(initialState);
		await store.dispatch(fetchTrashItems());

		assert.strictEqual(store.getActions().length, 2);
		assert.strictEqual(store.getActions()[0].type, REQUEST_TRASH_ITEMS);
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');
		assert.strictEqual(store.getActions()[1].type, RECEIVE_TRASH_ITEMS);
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');
		assert(store.getActions()[1].items.some(i => i.key === 'ITEM2222' ));

		assert.deepEqual(
			store.getActions()[1].items[0][Symbol.for('meta')],
			itemsFixture[0].meta
		);
	});

	it('createItem', async () => {
		fetchMock.post(/https:\/\/api\.zotero\.org\/users\/123\/items\?.*/, {
			body: {
				success: { "0": itemsFixture[0].key },
				failed: {},
				successful: { "0": itemsFixture[0] }
			},
			headers: { 'Last-Modified-Version': 70 }
		});
		const store = mockStore(initialState);
		const { version, key, dateAdded, dateModified, ...properties } = itemsFixture[0].data; // eslint-disable-line no-unused-vars
		await store.dispatch(createItem(properties));

		assert.strictEqual(store.getActions().length, 2);
		assert.deepEqual(store.getActions()[1].item, itemsFixture[0].data);
		assert.deepEqual(
			store.getActions()[1].item[Symbol.for('meta')],
			itemsFixture[0].meta
		);
		assert.typeOf(store.getActions()[1].response.response, 'object');
	});

	it('moveToTrash', async () => {
		fetchMock.post((url, opts) => {
				assert(url.match(/https:\/\/api\.zotero\.org\/users\/123\/items\??.*/));
				return true;
			}, {
			headers: {
				'Last-Modified-Version': 1337
			},
			body: {
				success: { '0': 'ITEM1111', '1': 'ITEM2222' },
				failed: {},
				successful: {
					'0': {
						key: 'ITEM1111',
						deleted: 1,
					},
					'1': {
						key: 'ITEM2222',
						deleted: 1
					}
				}
			},
		});

		const store = mockStore({
			...initialState,
			libraries: {
				u123: {
					itemsTop: ['ITEM1111', 'ITEM2222'],
					itemsTrash: [],
					itemsByCollection: {
						'AAAAAAAA': ['ITEM1111']
					},
					items: {
						'ITEM1111': {
							key: 'ITEM1111',
							version: 1,
							title: 'foo',
							collections: ['AAAAAAAA']
						},
						'ITEM2222': {
							key: 'ITEM2222',
							version: 1,
							title: 'bar',
							collections: []
						}
					}
				}
			}
		});

		const action = moveToTrash(['ITEM1111', 'ITEM2222']);
		await store.dispatch(action);

		assert.strictEqual(store.getActions()[0].type, PRE_MOVE_ITEMS_TRASH);
		assert.sameMembers(store.getActions()[0].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[1].type, REQUEST_MOVE_ITEMS_TRASH);
		assert.sameMembers(store.getActions()[1].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[2].type, RECEIVE_MOVE_ITEMS_TRASH);
		assert.sameMembers(store.getActions()[2].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.deepEqual(store.getActions()[2].itemKeysByCollection, {
			'AAAAAAAA': ['ITEM1111']
		});
		assert.sameMembers(store.getActions()[2].itemKeysTop, ['ITEM1111', 'ITEM2222']);
		assert.lengthOf(store.getActions()[2].items, 2);
		assert.strictEqual(store.getActions()[2].items[0].version, 1337);
		assert.typeOf(store.getActions()[2].response.response, 'object');
	});

	it('recoverFromTrash', async () => {
		fetchMock.post((url) => {
				assert(url.match(/https:\/\/api\.zotero\.org\/users\/123\/items\??.*/));
				return true;
			}, {
			headers: {
				'Last-Modified-Version': 1337
			},
			body: {
				success: { '0': 'ITEM1111', '1': 'ITEM2222' },
				failed: {},
				successful: {
					'0': {
						key: 'ITEM1111',
						deleted: 0,
					},
					'1': {
						key: 'ITEM2222',
						deleted: 0
					}
				}
			},
		});

		const store = mockStore({
			...initialState,
			libraries: {
				u123: {
					itemsTop: [],
					itemsTrash: ['ITEM1111', 'ITEM2222'],
					itemsByCollection: {
						'AAAAAAAA': ['ITEM1111']
					},
					items: {
						'ITEM1111': {
							key: 'ITEM1111',
							version: 1,
							title: 'foo',
							collections: ['AAAAAAAA'],
							deleted: 1
						},
						'ITEM2222': {
							key: 'ITEM2222',
							version: 1,
							title: 'bar',
							collections: [],
							deleted: 1
						}
					}
				}
			}
		});

		const action = recoverFromTrash(['ITEM1111', 'ITEM2222']);
		await store.dispatch(action);

		assert.strictEqual(store.getActions()[0].type, PRE_RECOVER_ITEMS_TRASH);
		assert.sameMembers(store.getActions()[0].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[1].type, REQUEST_RECOVER_ITEMS_TRASH);
		assert.sameMembers(store.getActions()[1].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[2].type, RECEIVE_RECOVER_ITEMS_TRASH);
		assert.sameMembers(store.getActions()[2].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.deepEqual(store.getActions()[2].itemKeysByCollection, {
			'AAAAAAAA': ['ITEM1111']
		});
		assert.sameMembers(store.getActions()[2].itemKeysTop, ['ITEM1111', 'ITEM2222']);
		assert.lengthOf(store.getActions()[2].items, 2);
		assert.strictEqual(store.getActions()[2].items[0].version, 1337);
		assert.typeOf(store.getActions()[2].response.response, 'object');
	});

	it('addToCollection', async () => {
		fetchMock.post((url) => {
				assert(url.match(/https:\/\/api\.zotero\.org\/users\/123\/items\??.*/));
				return true;
			}, {
			headers: {
				'Last-Modified-Version': 1337
			},
			body: {
				success: { '0': 'ITEM1111', '1': 'ITEM2222' },
				failed: {},
				successful: {
					'0': {
						key: 'ITEM1111',
						collections: ['AAAAAAAA']
					},
					'1': {
						key: 'ITEM2222',
						collections: ['AAAAAAAA']
					}
				}
			},
		});

		const store = mockStore({
			...initialState,
			libraries: {
				u123: {
					itemsTop: [],
					itemsByCollection: {
						'AAAAAAAA': [],
						'BBBBBBBB': ['ITEM2222']
					},
					items: {
						'ITEM1111': {
							key: 'ITEM1111',
							version: 1,
							title: 'foo',
							collections: [],
						},
						'ITEM2222': {
							key: 'ITEM2222',
							version: 1,
							title: 'bar',
							collections: ['BBBBBBBB'],
						}
					}
				}
			}
		});

		const action = addToCollection(['ITEM1111', 'ITEM2222'], 'AAAAAAAA');
		await store.dispatch(action);

		assert.strictEqual(store.getActions()[0].type, PRE_ADD_ITEMS_TO_COLLECTION);
		assert.sameMembers(store.getActions()[0].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[0].collectionKey, 'AAAAAAAA');
		assert.strictEqual(store.getActions()[0].libraryKey, 'u123');

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[1].type, REQUEST_ADD_ITEMS_TO_COLLECTION);
		assert.sameMembers(store.getActions()[1].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[1].collectionKey, 'AAAAAAAA');
		assert.strictEqual(store.getActions()[1].libraryKey, 'u123');

		await cede(); // allow async-queue process this request

		assert.strictEqual(store.getActions()[2].type, RECEIVE_ADD_ITEMS_TO_COLLECTION);
		assert.sameMembers(store.getActions()[2].itemKeys, ['ITEM1111', 'ITEM2222']);
		assert.strictEqual(store.getActions()[2].collectionKey, 'AAAAAAAA');

		assert.sameMembers(
			store.getActions()[2].items.find(i => i.key === 'ITEM1111').collections,
			['AAAAAAAA']
		);
		assert.sameMembers(
			store.getActions()[2].items.find(i => i.key === 'ITEM2222').collections,
			['AAAAAAAA', 'BBBBBBBB']
		);
		assert.typeOf(store.getActions()[2].response.response, 'object');
	});
});

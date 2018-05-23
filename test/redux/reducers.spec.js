'use strict';

const assert = require('chai').assert;
const configureStore = require('redux-mock-store');
const thunk = require('redux-thunk').default;
const { configureApi } = require('../../src/js/actions.js');
const reducers = require(('../../src/js/reducers.js'));
const {
	REQUEST_META,
	RECEIVE_META,
	REQUEST_COLLECTIONS_IN_LIBRARY,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	ERROR_COLLECTIONS_IN_LIBRARY,
	REQUEST_ITEMS_IN_COLLECTION,
	RECEIVE_ITEMS_IN_COLLECTION,
	ERROR_ITEMS_IN_COLLECTION,
	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	ERROR_UPDATE_ITEM,
	REQUEST_ITEM_TYPE_CREATOR_TYPES,
	RECEIVE_ITEM_TYPE_CREATOR_TYPES,
	REQUEST_ITEM_TYPE_FIELDS,
	RECEIVE_ITEM_TYPE_FIELDS,
	TRIGGER_EDITING_ITEM,
	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	ERROR_CHILD_ITEMS,
} = require('../../src/js/constants/actions.js');

const mockStore = configureStore([thunk]);
const { combineReducers } = require('redux');
const reduce = combineReducers(reducers);

describe('reducers', () => {
	it('config', () => {
		const action = configureApi('API_KEY', {
			apiAuthorityPart: 'apidev.zotero.org'
		});
		const state = reduce({}, action);
		assert.equal(state.config.apiKey, 'API_KEY');
		assert.deepEqual(state.config.apiConfig, {
			apiAuthorityPart: 'apidev.zotero.org'
		});
	});

	it('meta', () => {
		const data = {
			itemTypes: ['a'],
			itemFields: ['b'],
			creatorFields: ['c']
		};

		var state = {};

		state = reduce(state, {
			type: REQUEST_META
		});

		assert.strictEqual(state.fetching.meta, true);

		state = reduce({}, {
			type: RECEIVE_META,
			...data
		});

		assert.strictEqual(state.fetching.meta, false);
		assert.strictEqual(state.meta.itemTypes, data.itemTypes);
		assert.strictEqual(state.meta.itemFields, data.itemFields);
		assert.strictEqual(state.meta.creatorFields, data.creatorFields);

		state = reduce(state, {
			type: REQUEST_ITEM_TYPE_CREATOR_TYPES,
			itemType: 'book'
		});
		assert.sameMembers(state.fetching.itemTypeCreatorTypes, ['book']);

		state = reduce(state, {
			type: RECEIVE_ITEM_TYPE_CREATOR_TYPES,
			itemType: 'book',
			creatorTypes: ['d']
		});
		assert.isEmpty(state.fetching.itemTypeCreatorTypes);
		assert.deepEqual(state.meta.itemTypeCreatorTypes, { book: ['d'] });

		state = reduce(state, {
			type: REQUEST_ITEM_TYPE_FIELDS,
			itemType: 'journal'
		});
		assert.sameMembers(state.fetching.itemTypeFields, ['journal']);

		state = reduce(state, {
			type: RECEIVE_ITEM_TYPE_FIELDS,
			itemType: 'journal',
			fields: ['e']
		});
		assert.isEmpty(state.fetching.itemTypeFields);
		assert.deepEqual(state.meta.itemTypeFields, { journal: ['e'] });

	});

	it('collections', () => {
		const collectionData = [
			{
				key: 'c1',
				name: 'colllection 1'
			},
			{
				key: 'c2',
				name: 'colllection 2'
			}
		];
		var state = {};

		state = reduce(state, {
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123'
		});
		assert.sameMembers(state.fetching.collectionsInLibrary, ['u123']);
		assert.isEmpty(Object.keys(state.collections));

		state = reduce(state, {
			type: RECEIVE_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123',
			collections: collectionData,
			receivedAt: 1499438101816
		});

		assert.isEmpty(state.fetching.collectionsInLibrary);
		assert.lengthOf(Object.keys(state.collections), 2);
		assert.deepEqual(state.collections['c1u123'], collectionData[0]);
		assert.sameOrderedMembers(state.collectionsByLibrary['u123'], ['c1u123', 'c2u123']);
	});

	it('collections error', () => {
		var state = {};

		state = reduce(state, {
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123'
		});
		assert.sameMembers(state.fetching.collectionsInLibrary, ['u123']);

		state = reduce(state, {
			type: ERROR_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123',
			error: new Error('Failed')
		});

		assert.isEmpty(state.fetching.collectionsInLibrary);
	});

	describe('items', () => {
		const itemsData = [
			{
				key: 'ITEM1111',
				version: 1,
				title: 'item 1'
			},
			{
				key: 'ITEM2222',
				version: 1,
				title: 'item 2'
			}
		];

		it('fetching', () => {
			var state = {};

			state = reduce(state, {
				type: REQUEST_ITEMS_IN_COLLECTION,
				libraryKey: 'u123',
				collectionKey: 'AAAAAAAA'
			});

			assert.sameMembers(state.fetching.itemsInCollection, ['AAAAAAAAu123']);
			assert.isEmpty(state.items, {});

			state = reduce(state, {
				type: RECEIVE_ITEMS_IN_COLLECTION,
				collectionKey: 'AAAAAAAA',
				libraryKey: 'u123',
				items: itemsData,
				receivedAt: 1499438101816
			});

			assert.isEmpty(state.fetching.itemsInCollection, []);
			assert.deepEqual(state.items['ITEM1111u123'], itemsData[0]);
			assert.deepEqual(state.items['ITEM2222u123'], itemsData[1]);
			assert.sameOrderedMembers(state.itemsByCollection['AAAAAAAAu123'], ['ITEM1111u123', 'ITEM2222u123']);
		});

		it('updating', () => {
			var state = {
				items: {
					[itemsData[0].key + 'u123']: itemsData[0],
					[itemsData[1].key + 'u123']: itemsData[1]
				}
			};

			state = reduce(state, {
				type: REQUEST_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					title: 'foobar'
				}
			});

			assert.strictEqual(state.updating.items['ITEM1111u123']['title'], 'foobar');
			assert.strictEqual(state.items['ITEM1111u123'].version, 1);
			assert.strictEqual(state.items['ITEM1111u123'].title, 'item 1');

			state = reduce(state, {
				type: REQUEST_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					publisher: 'lorem'
				}
			});

			assert.deepEqual(state.updating.items['ITEM1111u123'], {
				title: 'foobar',
				publisher: 'lorem'
			});


			state = reduce(state, {
				type: RECEIVE_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				item: {
					...itemsData[0],
					version: 2,
					title: 'foobar'
				},
				patch: {
					title: 'foobar'
				}
			});

			assert.strictEqual(state.items['ITEM1111u123'].version, 2);
			assert.strictEqual(state.items['ITEM1111u123'].title, 'foobar');
			assert.deepEqual(state.updating.items['ITEM1111u123'], {
				publisher: 'lorem'
			});

			state = reduce(state, {
				type: RECEIVE_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				item: {
					...itemsData[0],
					version: 3,
					title: 'foobar',
					publisher: 'lorem'
				},
				patch: {
					publisher: 'lorem'
				}
			});

			assert.isEmpty(state.updating.items);
			assert.strictEqual(state.items['ITEM1111u123'].version, 3);
			assert.strictEqual(state.items['ITEM1111u123'].publisher, 'lorem');
		});

		it('fetching child items', () => {
			var state = {};
			state = reduce(state, {
				type: REQUEST_CHILD_ITEMS,
				itemKey: 'ITEM0000',
				libraryKey: 'u123'
			});

			assert.sameMembers(state.fetching.childItems, ['ITEM0000u123']);

			state = reduce(state, {
				type: RECEIVE_CHILD_ITEMS,
				itemKey: 'ITEM0000',
				libraryKey: 'u123',
				childItems: itemsData
			});

			assert.isEmpty(state.fetching.childItems);
			assert.deepEqual(state.items['ITEM1111u123'], itemsData[0]);
			assert.deepEqual(state.items['ITEM2222u123'], itemsData[1]);
			assert.sameOrderedMembers(state.itemsByParentItem['ITEM0000u123'], ['ITEM1111u123', 'ITEM2222u123']);
		});

		// it('editing', () => {
		// 	var state = {};

		// 	state = items(state, {
		// 		type: TRIGGER_EDITING_ITEM,
		// 		libraryKey: 'u123',
		// 		item


		// 	});

		// });
	});




	// it('initializes with required meta data', async () => {
	// 	const store = mockStore({});
	// 	await store.dispatch(initialize('API_KEY'));
	// 	console.log(store.getActions());
	// });


	// const initialState = {}

});

'use strict';

const configureStore = require('redux-mock-store').default;
const thunk = require('redux-thunk').default;
const fetchMock = require('fetch-mock');
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
		expect(state.config.apiKey).toEqual('API_KEY');
		expect(state.config.apiConfig).toEqual({
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

		expect(state.fetching.meta).toEqual(true);

		state = reduce({}, {
			type: RECEIVE_META,
			...data
		});

		expect(state.meta).toEqual(data);

		state = reduce(state, {
			type: REQUEST_ITEM_TYPE_CREATOR_TYPES,
			itemType: 'book'
		});
		expect(state.fetching.itemTypeCreatorTypes).toEqual(['book']);

		state = reduce(state, {
			type: RECEIVE_ITEM_TYPE_CREATOR_TYPES,
			itemType: 'book',
			creatorTypes: ['d']
		});
		expect(state.fetching.itemTypeCreatorTypes).toEqual([]);
		expect(state.meta.itemTypeCreatorTypes).toEqual(['d']);

		state = reduce(state, {
			type: REQUEST_ITEM_TYPE_FIELDS,
			itemType: 'journal'
		});
		expect(state.fetching.itemTypeFields).toEqual(['journal']);

		state = reduce(state, {
			type: RECEIVE_ITEM_TYPE_FIELDS,
			itemType: 'journal',
			fields: ['e']
		});
		expect(state.fetching.itemTypeFields).toEqual([]);
		expect(state.meta.itemTypeFields).toEqual(['e']);

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
		expect(state.fetching.collectionsInLibrary).toEqual(['u123']);
		expect(Object.keys(state.collections).length).toEqual(0);

		state = reduce(state, {
			type: RECEIVE_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123',
			collections: collectionData,
			receivedAt: 1499438101816
		});

		expect(state.fetching.collectionsInLibrary).toEqual([]);
		expect(Object.keys(state.collections).length).toEqual(2);
		expect(state.collections['c1u123']).toEqual(collectionData[0]);
		expect(state.collectionsByLibrary['u123']).toEqual(['c1u123', 'c2u123']);
	});

	it('collections error', () => {
		var state = {};

		state = reduce(state, {
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123'
		});
		expect(state.fetching.collectionsInLibrary).toEqual(['u123']);

		state = reduce(state, {
			type: ERROR_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123',
			error: new Error('Failed')
		});

		expect(state.fetching.collectionsInLibrary).toEqual([]);
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

			expect(state.fetching.itemsInCollection).toEqual(['AAAAAAAAu123']);
			expect(state.items).toEqual({});

			state = reduce(state, {
				type: RECEIVE_ITEMS_IN_COLLECTION,
				collectionKey: 'AAAAAAAA',
				libraryKey: 'u123',
				items: itemsData,
				receivedAt: 1499438101816
			});

			expect(state.fetching.itemsInCollection).toEqual([]);
			expect(state.items['ITEM1111u123']).toEqual(itemsData[0]);
			expect(state.items['ITEM2222u123']).toEqual(itemsData[1]);
			expect(state.itemsByCollection['AAAAAAAAu123']).toEqual(['ITEM1111u123', 'ITEM2222u123']);
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

			expect(state.updating.items['ITEM1111u123']['title']).toEqual('foobar');
			expect(state.items['ITEM1111u123'].version).toEqual(1);
			expect(state.items['ITEM1111u123'].title).toEqual('item 1');

			state = reduce(state, {
				type: REQUEST_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					publisher: 'lorem'
				}
			});

			expect(state.updating.items['ITEM1111u123']).toEqual({
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

			expect(state.items['ITEM1111u123'].version).toEqual(2);
			expect(state.items['ITEM1111u123'].title).toEqual('foobar');
			expect(state.updating.items['ITEM1111u123']).toEqual({
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

			expect(state.updating.items).toEqual({});
			expect(state.items['ITEM1111u123'].version).toEqual(3);
			expect(state.items['ITEM1111u123'].publisher).toEqual('lorem');
		});

		it('fetching child items', () => {
			var state = {};
			state = reduce(state, {
				type: REQUEST_CHILD_ITEMS,
				itemKey: 'ITEM0000',
				libraryKey: 'u123'
			});

			expect(state.fetching.childItems).toEqual(['ITEM0000u123']);

			state = reduce(state, {
				type: RECEIVE_CHILD_ITEMS,
				itemKey: 'ITEM0000',
				libraryKey: 'u123',
				childItems: itemsData
			});

			expect(state.fetching.childItems).toEqual([]);
			expect(state.items['ITEM1111u123']).toEqual(itemsData[0]);
			expect(state.items['ITEM2222u123']).toEqual(itemsData[1]);
			expect(state.itemsByParentItem['ITEM0000u123']).toEqual(['ITEM1111u123', 'ITEM2222u123']);
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

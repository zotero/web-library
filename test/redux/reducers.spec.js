'use strict';

const assert = require('chai').assert;
const { configureApi } = require('../../src/js/actions');
const reducers = require('../../src/js/reducers');
const {
	ERROR_COLLECTIONS_IN_LIBRARY,
	PRE_UPDATE_ITEM,
	RECEIVE_CHILD_ITEMS,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_ITEM_TYPE_CREATOR_TYPES,
	RECEIVE_ITEM_TYPE_FIELDS,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_META,
	RECEIVE_UPDATE_ITEM,
	REQUEST_CHILD_ITEMS,
	REQUEST_COLLECTIONS_IN_LIBRARY,
	REQUEST_ITEM_TYPE_CREATOR_TYPES,
	REQUEST_ITEM_TYPE_FIELDS,
	REQUEST_ITEMS_IN_COLLECTION,
	REQUEST_META,
	REQUEST_UPDATE_ITEM,
	RECEIVE_MOVE_ITEMS_TRASH,
} = require('../../src/js/constants/actions.js');
const stateFixture = require('../fixtures/state.json');
const { combineReducers } = require('redux');
const reduce = combineReducers(reducers);

const getTestState = () => JSON.parse(JSON.stringify(stateFixture));

describe('reducers', () => {
	it('config', () => {
		const action = configureApi('u123', 'API_KEY', {
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
		assert.isEmpty(Object.keys(state.libraries.u123.collections));

		state = reduce(state, {
			type: RECEIVE_COLLECTIONS_IN_LIBRARY,
			libraryKey: 'u123',
			collections: collectionData,
			receivedAt: 1499438101816,
			response: { getData: () => [], getMeta: () => [] }
		});

		assert.isEmpty(state.fetching.collectionsInLibrary);
		assert.lengthOf(Object.keys(state.libraries.u123.collections), 2);
		assert.deepEqual(state.libraries.u123.collections.c1, collectionData[0]);
		assert.deepEqual(Object.keys(state.libraries.u123.collections), ['c1', 'c2']);
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
				collectionKey: 'CLECTION'
			});

			assert.sameMembers(state.libraries.u123.fetching.itemsInCollection, ['CLECTION']);
			assert.isEmpty(state.libraries.u123.items);

			state = reduce(state, {
				type: RECEIVE_ITEMS_IN_COLLECTION,
				collectionKey: 'CLECTION',
				libraryKey: 'u123',
				items: itemsData,
				receivedAt: 1499438101816
			});

			assert.isEmpty(state.libraries.u123.fetching.itemsInCollection, []);
			assert.deepEqual(state.libraries.u123.items['ITEM1111'], itemsData[0]);
			assert.deepEqual(state.libraries.u123.items['ITEM2222'], itemsData[1]);
			assert.sameOrderedMembers(
				state.libraries.u123.itemsByCollection['CLECTION'],
				['ITEM1111', 'ITEM2222']
			);
		});

		it('updating', () => {
			var state = {
				libraries: {
					u123: {
						items: {
							[itemsData[0].key]: itemsData[0],
							[itemsData[1].key]: itemsData[1],
						}
					}
				}
			};

			state = reduce(state, {
				type: PRE_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					title: 'foobar'
				},
				queueId: 1
			});

			state = reduce(state, {
				type: REQUEST_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					title: 'foobar'
				},
				queueId: 1
			});

			assert.lengthOf(state.libraries.u123.updating.items.ITEM1111, 1);
			assert.strictEqual(state.libraries.u123.updating.items.ITEM1111[0].patch.title, 'foobar');
			assert.strictEqual(state.libraries.u123.items['ITEM1111'].version, 1);
			assert.strictEqual(state.libraries.u123.items['ITEM1111'].title, 'item 1');

			state = reduce(state, {
				type: PRE_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					publisher: 'lorem'
				},
				queueId: 2
			});

			state = reduce(state, {
				type: REQUEST_UPDATE_ITEM,
				libraryKey: 'u123',
				itemKey: itemsData[0].key,
				patch: {
					publisher: 'lorem'
				},
				queueId: 2
			});

			assert.lengthOf(state.libraries.u123.updating.items.ITEM1111, 2);
			assert.strictEqual(state.libraries.u123.updating.items.ITEM1111[0].patch.title, 'foobar');
			assert.strictEqual(state.libraries.u123.updating.items.ITEM1111[1].patch.publisher, 'lorem');


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
				},
				queueId: 1
			});

			assert.strictEqual(state.libraries.u123.items['ITEM1111'].version, 2);
			assert.strictEqual(state.libraries.u123.items['ITEM1111'].title, 'foobar');
			assert.lengthOf(state.libraries.u123.updating.items.ITEM1111, 1);

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
				},
				queueId: 2,
			});

			assert.isEmpty(state.libraries.u123.updating.items);
			assert.strictEqual(state.libraries.u123.items['ITEM1111'].version, 3);
			assert.strictEqual(state.libraries.u123.items['ITEM1111'].publisher, 'lorem');
		});

		it('fetching child items', () => {
			var state = {};
			state = reduce(state, {
				type: REQUEST_CHILD_ITEMS,
				itemKey: 'ITEM0000',
				libraryKey: 'u123'
			});

			assert.sameMembers(state.libraries.u123.fetching.childItems, ['ITEM0000']);

			state = reduce(state, {
				type: RECEIVE_CHILD_ITEMS,
				itemKey: 'ITEM0000',
				libraryKey: 'u123',
				childItems: itemsData
			});

			assert.isEmpty(state.libraries.u123.fetching.childItems);
			assert.deepEqual(state.libraries.u123.items['ITEM1111'], itemsData[0]);
			assert.deepEqual(state.libraries.u123.items['ITEM2222'], itemsData[1]);
			assert.sameOrderedMembers(
				state.libraries.u123.itemsByParent['ITEM0000'],
				['ITEM1111', 'ITEM2222']
			);
		});

		it('moving items to trash', () => {
			var state = getTestState();
			const libraryKey = state.current.library;
			const collectionKey = Object.keys(
				state.libraries[libraryKey].itemsByCollection
			)[0];
			const itemsToTrashFromCollections = state.libraries[libraryKey].itemsByCollection[collectionKey].slice(0, 2);
			const itemsToTrashTop = Object.values(
				state.libraries[libraryKey].itemsTop
			).slice(0, 2);
			const itemsToTrash = [...itemsToTrashFromCollections, ...itemsToTrashTop];
			const originalCollectionCount = state.libraries[libraryKey].itemCountByCollection[collectionKey];
			const originalTopCount = state.itemCountTopByLibrary[libraryKey];

			state = reduce(state, {
				type: RECEIVE_MOVE_ITEMS_TRASH,
				items: Object.assign(...Object.keys(state.libraries[libraryKey].items)
					.filter(itemKey => itemsToTrash.includes(itemKey))
					.map( itemKey => ({ [itemKey]: {
						key: itemKey,
						deleted: 1
				}}))),
				itemKeys: itemsToTrash,
				itemKeysByCollection: {
					[collectionKey]: itemsToTrashFromCollections
				},
				itemKeysTop: itemsToTrashTop,
				libraryKey
			});

			assert.notIncludeMembers(
				state.libraries[libraryKey].itemsByCollection[collectionKey],
				itemsToTrashFromCollections
			);
			assert.notIncludeMembers(
				state.libraries[libraryKey].itemsTop,
				itemsToTrashTop
			);
			assert.equal(
				state.libraries[libraryKey].itemCountByCollection[collectionKey],
				originalCollectionCount - 2
			);
			assert.equal(
				state.itemCountTopByLibrary[libraryKey],
				originalTopCount - 2
			);
			assert.sameMembers(
				state.libraries[libraryKey].itemsTrash,
				itemsToTrash
			);
			assert.strictEqual(
				state.libraries[libraryKey].items[itemsToTrash[0]].deleted,
				1
			);
		});
	});
});

'use strict';

const assert = require('chai').assert;
const { configureApi } = require('../../src/js/actions');
const reducers = require('../../src/js/reducers');
const {
	ERROR_COLLECTIONS_IN_LIBRARY,
	PRE_UPDATE_COLLECTION,
	PRE_UPDATE_ITEM,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_CHILD_ITEMS,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_CREATE_COLLECTION,
	RECEIVE_CREATE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_ITEM_TYPE_CREATOR_TYPES,
	RECEIVE_ITEM_TYPE_FIELDS,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_META,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_UPDATE_COLLECTION,
	RECEIVE_UPDATE_ITEM,
	REQUEST_CHILD_ITEMS,
	REQUEST_COLLECTIONS_IN_LIBRARY,
	REQUEST_ITEM_TYPE_CREATOR_TYPES,
	REQUEST_ITEM_TYPE_FIELDS,
	REQUEST_ITEMS_IN_COLLECTION,
	REQUEST_META,
	REQUEST_UPDATE_COLLECTION,
	REQUEST_UPDATE_ITEM,
	RECEIVE_DELETE_COLLECTION,
} = require('../../src/js/constants/actions.js');
const stateFixture = require('../fixtures/state.json');
const { combineReducers } = require('redux');
const reduce = combineReducers(reducers);

const getTestState = () => JSON.parse(JSON.stringify(stateFixture));
const mockResponse = {
	getData: () => [],
	getMeta: () => [],
	response: new Response('', { headers: { 'Last-Modified-Version': 1337 } })
};
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
			response: mockResponse
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

	it('fetching items', () => {
		var state = {};

		state = reduce(state, {
			type: REQUEST_ITEMS_IN_COLLECTION,
			libraryKey: 'u123',
			collectionKey: 'CLECTION',
		});

		assert.sameMembers(state.libraries.u123.fetching.itemsInCollection, ['CLECTION']);
		assert.isEmpty(state.libraries.u123.items);

		state = reduce(state, {
			type: RECEIVE_ITEMS_IN_COLLECTION,
			collectionKey: 'CLECTION',
			libraryKey: 'u123',
			items: itemsData,
			receivedAt: 1499438101816,
			response: mockResponse
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
			queueId: 1,
			response: mockResponse
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
			response: mockResponse
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
			childItems: itemsData,
			response: mockResponse
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
		state.itemCountTrashByLibrary[libraryKey] = 0;
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
			libraryKey,
			response: mockResponse
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
		assert.equal(
			state.itemCountTrashByLibrary[libraryKey],
			4
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

	it('recover items from trash', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];

		//prepare state
		const itemKeysTrashedFromCollections = state.libraries[libraryKey].itemsByCollection[collectionKey].splice(0, 2);
		const originalCollectionCount = state.libraries[libraryKey].itemCountByCollection[collectionKey] = state.libraries[libraryKey].itemCountByCollection[collectionKey] - 2;
		const itemKeysTrashedFromTop = state.libraries[libraryKey].itemsTop.splice(0, 2);
		const originalTopCount = state.itemCountTopByLibrary[libraryKey] = state.libraries[libraryKey].itemCountByCollection[collectionKey] - 2;
		const itemKeysTrashed = [...itemKeysTrashedFromCollections, ...itemKeysTrashedFromTop];
		state.itemCountTrashByLibrary[libraryKey] = itemKeysTrashed.length;

		state.libraries[libraryKey].itemsTrash = [...itemKeysTrashed];
		state.libraries[libraryKey].items = Object.assign(...Object.values(state.libraries[libraryKey].items)
			.map(item => ({ [item.key]: {
				...item,
				deleted: itemKeysTrashed.includes(item.key) ? 1 : 0
			}}))
		);

		state = reduce(state, {
			type: RECEIVE_RECOVER_ITEMS_TRASH,
			items: Object.assign(...Object.keys(state.libraries[libraryKey].items)
				.filter(itemKey => itemKeysTrashed.includes(itemKey))
				.map( itemKey => ({ [itemKey]: {
					key: itemKey,
					deleted: 0
			}}))),
			itemKeys: itemKeysTrashed,
			itemKeysByCollection: {
				[collectionKey]: itemKeysTrashedFromCollections
			},
			itemKeysTop: itemKeysTrashedFromTop,
			libraryKey,
			response: mockResponse
		});

		assert.includeMembers(
			state.libraries[libraryKey].itemsByCollection[collectionKey],
			itemKeysTrashedFromCollections
		);
		assert.includeMembers(
			state.libraries[libraryKey].itemsTop,
			itemKeysTrashedFromTop
		);
		assert.equal(
			state.libraries[libraryKey].itemCountByCollection[collectionKey],
			originalCollectionCount + 2
		);
		assert.equal(
			state.itemCountTopByLibrary[libraryKey],
			originalTopCount + 2
		);
		assert.equal(
			state.itemCountTrashByLibrary[libraryKey],
			0
		);
		assert.isEmpty(state.libraries[libraryKey].itemsTrash);
		assert.strictEqual(
			state.libraries[libraryKey].items[itemKeysTrashed[0]].deleted,
			0
		);
	});

	it('delete items', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];

		//prepare state
		const itemKeysTrashedFromCollections = state.libraries[libraryKey].itemsByCollection[collectionKey].splice(0, 2);
		const itemKeysTrashedFromTop = state.libraries[libraryKey].itemsTop.splice(0, 2);
		const itemKeysTrashed = [...itemKeysTrashedFromCollections, ...itemKeysTrashedFromTop];
		state.itemCountTrashByLibrary[libraryKey] = itemKeysTrashed.length;

		state = reduce(state, {
			type: RECEIVE_DELETE_ITEMS,
			itemKeys: itemKeysTrashed,
			libraryKey,
			response: mockResponse,
		});

		assert.isEmpty(state.libraries[libraryKey].itemsTrash);
		assert.notIncludeMembers(
			Object.keys(state.libraries[libraryKey].items),
			itemKeysTrashed
		);
		assert.equal(
			state.itemCountTrashByLibrary[libraryKey],
			0
		);
		assert.isEmpty(state.libraries[libraryKey].itemsTrash);
	});

	it('add item to collection', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];
		const itemKeys = state.libraries[libraryKey].itemsTop.slice(0, 3);
		const originalCollectionCount = state.libraries[libraryKey].itemCountByCollection[collectionKey];
		itemKeys.forEach(itemKey => {
			assert.notInclude(
				state.libraries[libraryKey].items[itemKey].collections,
				collectionKey
			)
		});
		assert.notIncludeMembers(
			state.libraries[libraryKey].itemsByCollection[collectionKey],
			itemKeys
		);
		state = reduce(state, {
			type: RECEIVE_ADD_ITEMS_TO_COLLECTION,
			items: Object.assign(...Object.keys(state.libraries[libraryKey].items)
				.filter(itemKey => itemKeys.includes(itemKey))
				.map( itemKey => ({ [itemKey]: {
					key: itemKey,
					collections: [
						...state.libraries[libraryKey].items[itemKey].collections,
						collectionKey
					]
			}}))),
			itemKeys,
			itemKeysChanged: itemKeys,
			collectionKey,
			libraryKey,
			response: mockResponse
		});

		itemKeys.forEach(itemKey => {
			assert.include(
				state.libraries[libraryKey].items[itemKey].collections,
				collectionKey
			)
		});

		assert.includeMembers(
			state.libraries[libraryKey].itemsByCollection[collectionKey],
			itemKeys
		);

		assert.strictEqual(
			state.libraries[libraryKey].itemCountByCollection[collectionKey],
			originalCollectionCount + 3
		);
	});

	it('create a new item', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];
		const originalCollectionCount = state.libraries[libraryKey].itemCountByCollection[collectionKey];
		const originalTopCount = state.itemCountTopByLibrary[libraryKey];
		state = reduce(state, {
			type: RECEIVE_CREATE_ITEM,
			item: {
				key: 'AAAAAAAA',
				'itemType' : 'book',
				'title' : '',
				'creators' : [{
					'creatorType' : 'author',
					'firstName' : '',
					'lastName' : ''
				}],
				'url' : '',
				'tags' : [],
				'collections' : [collectionKey],
				'relations' : {}
			},
			libraryKey,
			response: mockResponse
		});

		assert.strictEqual(
			state.libraries[libraryKey].items['AAAAAAAA'].itemType,
			'book'
		);
		assert.include(
			state.libraries[libraryKey].itemsByCollection[collectionKey],
			'AAAAAAAA'
		);
		assert.include(
			state.libraries[libraryKey].itemsTop,
			'AAAAAAAA'
		);
		assert.strictEqual(
			state.libraries[libraryKey].itemCountByCollection[collectionKey],
			originalCollectionCount + 1
		);
		assert.strictEqual(
			state.itemCountTopByLibrary[libraryKey],
			originalTopCount + 1
		);
	});

	it('create a collection item', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];
		state = reduce(state, {
			type: RECEIVE_CREATE_COLLECTION,
			collection: {
				key: 'COLCOL11',
				version: 1337,
				name: 'New Collection',
				parentCollection: collectionKey,
				relations : {}
			},
			libraryKey,
			response: mockResponse
		});

		assert.strictEqual(
			state.libraries[libraryKey].collections['COLCOL11'].name,
			'New Collection'
		);
	});

	it('update existing collection', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];
		const collectionData = { ...state.libraries[libraryKey].collections[collectionKey] };

		state = reduce(state, {
			type: PRE_UPDATE_COLLECTION,
			libraryKey,
			collectionKey,
			patch: {
				name: 'foobar'
			},
			queueId: 1
		});

		state = reduce(state, {
			type: REQUEST_UPDATE_COLLECTION,
			libraryKey,
			collectionKey,
			patch: {
				name: 'foobar'
			},
			queueId: 1
		});

		assert.lengthOf(state.libraries[libraryKey].updating.collections[collectionKey], 1);
		assert.strictEqual(
			state.libraries[libraryKey].updating.collections[collectionKey][0].patch.name,
			'foobar'
		);
		assert.strictEqual(state.libraries[libraryKey].collections[collectionKey].version, 1);
		assert.strictEqual(
			state.libraries[libraryKey].collections[collectionKey].name,
			collectionData.name
		);

		state = reduce(state, {
			type: RECEIVE_UPDATE_COLLECTION,
			libraryKey,
			collectionKey,
			patch: {
				name: 'foobar'
			},
			queueId: 1,
			collection: {
				...collectionData,
				version: 3,
				name: 'foobar'
			},
			response: mockResponse
		});

		assert.isEmpty(state.libraries[libraryKey].updating.collections);
		assert.strictEqual(state.libraries[libraryKey].collections[collectionKey].name, 'foobar');
		assert.strictEqual(state.libraries[libraryKey].collections[collectionKey].version, 3);
		assert.strictEqual(
			state.libraries[libraryKey].collections[collectionKey].name,
			'foobar'
		);
	});

	it('delete a collection', () => {
		var state = getTestState();
		const libraryKey = state.current.library;
		const collectionKey = Object.keys(
			state.libraries[libraryKey].itemsByCollection
		)[0];

		state = reduce(state, {
			type: RECEIVE_DELETE_COLLECTION,
			collection: { ...state.libraries[libraryKey].collections[collectionKey] },
			libraryKey,
			response: mockResponse,
		});

		assert.notProperty(
			state.libraries[libraryKey].collections,
			collectionKey
		);

		assert.notProperty(
			state.libraries[libraryKey].itemCountByCollection,
			collectionKey
		);
	});
});

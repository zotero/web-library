'use strict';


const collectionsFixture = require('./fixtures/collections');
const itemsFixture = require('./fixtures/items-top');
const {
	getCollection,
	getCollections,
	getTopCollections,
	getItem,
	getItems,
	getCollectionsPath,
	getCurrentViewFromState,
	getItemFieldValue,
	isItemFieldBeingUpdated
} = require('../src/js/state-utils');

const { ck } = require('../src/js/utils');

const LIBRARY_KEY = 'u123456';

describe('state-utils', () => {
	const collections = collectionsFixture.map(c => c.data);
	const items = itemsFixture.map(i => i.data);
	var state;

	beforeEach(() => {
		state = {
			library: {
				libraryKey: LIBRARY_KEY
			},
			collectionsByLibrary: {
				[LIBRARY_KEY]: collections.map(c => ck(c.key, LIBRARY_KEY))
			},
			collections: collections.reduce((aggr, c) => {
				aggr[ck(c.key, LIBRARY_KEY)] = c;
				return aggr;
			}, {}),
			items: items.reduce((aggr, i) => {
				aggr[ck(i.key, LIBRARY_KEY)] = i;
				return aggr;
			}, {}),
			itemsByCollection: {
				[ck('AAAAAAAA', LIBRARY_KEY)]: [ck('ITEM1111', LIBRARY_KEY), ck('ITEM2222', LIBRARY_KEY)]
			},
			updating: {},
			fetchItems: {}
		};
	});

	it('getCollection', () => {
		expect(getCollection(state)).toBeNull();
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001'
				}
			}
		};
		expect(getCollection(state).key).toEqual('AAAA0001');
		expect(getCollection(state).name).toEqual('Test Collection A1');
	});

	it('getCollections', () => {
		expect(getCollections(state)).toEqual(collections);
	});

	it('getTopCollections', () => {
		expect(getTopCollections(state)).toEqual(collections.filter(c => c.key !== 'AAAA0001'));
	});

	it('getItem', () => {
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAAAAAA',
					item: 'ITEM1111'
				}
			}
		};
		expect(getItem(state)).toEqual(items[1]);
	});

	it('getItems', () => {
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAAAAAA'
				}
			}
		};
		expect(getItems(state).length).toEqual(2);
		expect(getItems(state)[0].key).toEqual('ITEM1111');
		expect(getItems(state)[0].title).toEqual('document-1');
		expect(getItems(state)[1].key).toEqual('ITEM2222');
		expect(getItems(state)[1].title).toEqual('document-2');
	});

	it('getCollectionsPath', () => {
		expect(getCollectionsPath(state)).toEqual([]);
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001'
				}
			}
		};
		expect(getCollectionsPath(state)).toEqual(['AAAAAAAA', 'AAAA0001']);
	});

	it('getCurrentViewFromState', () => {
		expect(getCurrentViewFromState(state)).toEqual('library');
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001'
				}
			}
		};
		expect(getCurrentViewFromState(state)).toEqual('item-list');
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAAAAAA',
					item: 'ITEM1111'
				}
			}
		};
		expect(getCurrentViewFromState(state)).toEqual('item-details');
	});

	it('getItemFieldValue', () => {
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001',
					item: 'ITEM1111'
				}
			}
		};
		expect(getItemFieldValue('title', state)).toEqual('document-1');

		state = {
			...state,
			updating: {
				items: {
					[ck('ITEM1111', LIBRARY_KEY)]: {
						title: 'foobar'
					}
				}
			}
		};
		expect(getItemFieldValue('title', state)).toEqual('foobar');
	});

	it('isItemFieldBeingUpdated', () => {
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001',
					item: 'ITEM1111'
				}
			},
			updating: {
				items: {
					[ck('ITEM1111', LIBRARY_KEY)]: {
						title: 'foobar'
					}
				}
			}
		};
		expect(isItemFieldBeingUpdated('title', state)).toEqual(true);
		expect(isItemFieldBeingUpdated('publisher', state)).toEqual(false);
	});
});
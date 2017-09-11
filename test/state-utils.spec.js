'use strict';

const assert = require('chai').assert;
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
		assert.isNull(getCollection(state));
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001'
				}
			}
		};
		assert.equal(getCollection(state).key, 'AAAA0001');
		assert.equal(getCollection(state).name, 'Test Collection A1');
	});

	it('getCollections', () => {
		assert.deepEqual(getCollections(state), collections);
	});

	it('getTopCollections', () => {
		assert.deepEqual(getTopCollections(state), collections.filter(c => c.key !== 'AAAA0001'));
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
		assert.equal(getItem(state), items[1]);
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
		assert.equal(getItems(state).length, 2);
		assert.equal(getItems(state)[0].key, 'ITEM1111');
		assert.equal(getItems(state)[0].title, 'document-1');
		assert.equal(getItems(state)[1].key, 'ITEM2222');
		assert.equal(getItems(state)[1].title, 'document-2');
	});

	it('getCollectionsPath', () => {
		assert.isEmpty(getCollectionsPath(state));
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001'
				}
			}
		};
		assert.sameOrderedMembers(getCollectionsPath(state), ['AAAAAAAA', 'AAAA0001']);
	});

	it('getCurrentViewFromState', () => {
		assert.equal(getCurrentViewFromState(state), 'library');
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAA0001'
				}
			}
		};
		assert.equal(getCurrentViewFromState(state), 'item-list');
		state = {
			...state,
			router: {
				params: {
					collection: 'AAAAAAAA',
					item: 'ITEM1111'
				}
			}
		};
		assert.equal(getCurrentViewFromState(state), 'item-details');
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
		assert.equal(getItemFieldValue('title', state), 'document-1');

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
		assert.equal(getItemFieldValue('title', state), 'foobar');
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
		assert.equal(isItemFieldBeingUpdated('title', state), true);
		assert.equal(isItemFieldBeingUpdated('publisher', state), false);
	});
});
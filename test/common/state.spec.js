'use strict';

const assert = require('chai').assert;
const collectionsFixture = require('../fixtures/collections');
const itemsFixture = require('../fixtures/items');
const { getCollectionsPath, getItemFieldValue } = require('../../src/js/common/state');
const LIBRARY_KEY = 'u123456';

describe('state', () => {
	const collections = collectionsFixture
		.map(c => c.data)
		.reduce((aggr, collection) => {
			aggr[collection.key] = collection;
			return aggr;
		}, {})
	const items = itemsFixture
		.map(i => i.data)
		.reduce((aggr, item) => {
			aggr[item.key] = item;
			return aggr;
		}, {})
	var state;

	beforeEach(() => {
		state = {
			current: {
				library: LIBRARY_KEY
			},
			libraries: {
				[LIBRARY_KEY]: { collections, items }
			}
		};
	});

	it('getCollectionsPath', () => {
		assert.isEmpty(getCollectionsPath(state));
		state = {
			...state,
			current: {
				...state.current,
				collection: 'AAAA0001'
			}
		};
		assert.sameOrderedMembers(getCollectionsPath(state), ['AAAAAAAA', 'AAAA0001']);
	});

	it('getItemFieldValue', () => {
		state = {
			...state,
			current: {
				...state.current,
				collection: 'AAAA0001',
				item: 'ITEM1111'
			}
		};
		assert.equal(getItemFieldValue('title', state), 'document-1');

		state = {
			...state,
			libraries: {
				[LIBRARY_KEY]: {
					...state.libraries[LIBRARY_KEY],
					updating: {
						items: {
							ITEM1111: [
								{ patch: { title: 'foobar' } }
							]
						}
					}
				}
			}
		};
		assert.equal(getItemFieldValue('title', state), 'foobar');
	});

});

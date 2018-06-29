'use strict';

const assert = require('chai').assert;

const { enhanceCollections, } = require('../src/js/utils');
const collectionsFixture = require('./fixtures/collections');

describe('utils', () => {
	it('should enhance collections with children', () => {
		const enhanced = enhanceCollections(collectionsFixture.map(c => c.data));
		assert.equal(enhanced.find(c => c.key === 'AAAAAAAA').hasChildren, true);
		assert.sameMembers(enhanced.find(c => c.key === 'AAAAAAAA').children, ['AAAA0001']);
		assert.equal(enhanced.find(c => c.key === 'BBBBBBBB').hasChildren, false);
		assert.equal(enhanced.find(c => c.key === 'CCCCCCCC').hasChildren, false);
		assert.equal(enhanced.find(c => c.key === 'AAAA0001').hasChildren, false);
	});

	it('should enhance collections with path', () => {
		const enhanced = enhanceCollections(collectionsFixture.map(c => c.data), ['AAAAAAAA', 'AAAA0001']);
		assert.equal(enhanced.find(c => c.key === 'AAAAAAAA').isOpen, true);
		assert.equal(enhanced.find(c => c.key === 'AAAA0001').isSelected, true);
		assert.equal(enhanced.find(c => c.key === 'AAAA0001').isOpen, false);
	});

});

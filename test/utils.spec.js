'use strict';

const { 
	enhanceCollections,
	isNewValue,
	ck
} = require('../src/js/utils');
const collectionsFixture = require('./fixtures/collections');

describe('utils', () => {
	it('should enhance collections with children', () => {
		const enhanced = enhanceCollections(collectionsFixture.map(c => c.data));
		expect(enhanced.find(c => c.key === 'AAAAAAAA').hasChildren).toEqual(true);
		expect(enhanced.find(c => c.key === 'AAAAAAAA').children).toEqual(['AAAA0001']);
		expect(enhanced.find(c => c.key === 'BBBBBBBB').hasChildren).toEqual(false);
		expect(enhanced.find(c => c.key === 'CCCCCCCC').hasChildren).toEqual(false);
		expect(enhanced.find(c => c.key === 'AAAA0001').hasChildren).toEqual(false);
	});

	it('should enhance collections with path', () => {
		const enhanced = enhanceCollections(collectionsFixture.map(c => c.data), ['AAAAAAAA', 'AAAA0001']);
		expect(enhanced.find(c => c.key === 'AAAAAAAA').isOpen).toEqual(true);
		expect(enhanced.find(c => c.key === 'AAAA0001').isSelected).toEqual(true);
		expect(enhanced.find(c => c.key === 'AAAA0001').isOpen).toEqual(false);
	});

	it('should detect when new, usable object value is received', () => {
		expect(isNewValue(undefined, null)).toEqual(false);
		expect(isNewValue(null, null)).toEqual(false);
		expect(isNewValue({key: 1}, {key: 1})).toEqual(false);

		expect(isNewValue(null, {key: 1})).toEqual(true);
		expect(isNewValue(undefined, {key: 1})).toEqual(true);
		expect(isNewValue({key: 0}, {key: 1})).toEqual(true);

		expect(isNewValue({key: 1}, null)).toEqual(false);
	});

	it('should generate a compound key', () => {
		expect(ck('ITEM1234', 'u111')).toEqual('ITEM1234u111');
	});
});
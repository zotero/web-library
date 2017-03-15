import React from 'react';
import renderer from 'react-test-renderer';

import CollectionTree from '../src/js/component/collection-tree';
import collectionsFix from './fixtures/collections';

const mapCollectionsRecursive = (col, f) => {
	return col.map(c => {
		c = f(c);
		if(c.children.length) {
			c.children = mapCollectionsRecursive(c.children, f);
		}
		return c;
	});
};

it('Renders collapsed', () => {
	let collections = mapCollectionsRecursive(collectionsFix, c => ({
		isOpen: false,
		isSelected: false,
		...c
	}));
	let tree = renderer.create(
		<CollectionTree collections = { collections } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders expanded', () => {
	let collections = mapCollectionsRecursive(collectionsFix, c => ({
		isOpen: true,
		isSelected: false,
		...c
	}));
	let tree = renderer.create(
		<CollectionTree collections = { collections } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});
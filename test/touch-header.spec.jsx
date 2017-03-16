import React from 'react';
import renderer from 'react-test-renderer';

import TouchHeader from '../src/js/component/touch-header';
import collectionsFix from './fixtures/collections';

const flatten = (col, pathSoFar) => {
	pathSoFar.push(col);
	if('children' in col && col.children.length) {
		pathSoFar = flatten(col.children[0], pathSoFar);
	}
	return pathSoFar;
};

it('Renders touch header at arbitrary depth', () => {
	let path = flatten(collectionsFix[0], []);
	let tree = renderer.create(
		<TouchHeader path={ path } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders touch header at root', () => {
	let tree = renderer.create(
		<TouchHeader path={ [] } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

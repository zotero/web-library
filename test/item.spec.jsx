import React from 'react';
import renderer from 'react-test-renderer';

import ItemList from '../src/js/component/item/list';
import itemsFix from './fixtures/items';

it('Renders items list with data', () => {
	let tree = renderer.create(
		<ItemList items={ itemsFix } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders items list empty', () => {
	let tree = renderer.create(
		<ItemList items={ [] } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders items list fetching', () => {
	let tree = renderer.create(
		<ItemList items={ itemsFix } isFetching={ true } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});
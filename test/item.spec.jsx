import React from 'react';
import renderer from 'react-test-renderer';

import ItemList from '../src/js/component/item/list';
import itemsFix from './fixtures/items';

let mockZoteroItem = item => {
	return {
		key: item['key'],
		get: key => key in item.data ? item.data[key] : null,
		set: () => {}
	};
};

it('Renders items list with data', () => {
	let tree = renderer.create(
		<ItemList items={ itemsFix.map(i => mockZoteroItem(i)) } />
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
		<ItemList items={ itemsFix.map(i => mockZoteroItem(i)) } isFetching={ true } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});
'use strict';

const React = require('react');
const { render } = require('enzyme');
const ItemList = require('../../src/js/component/item/list');
const itemsFixture = require('../fixtures/items-top');


describe('<ItemList />', () => {
	var items;
	
	beforeEach(() => {
		items = itemsFixture.map(i => i.data);
	});

	it('renders all the items in the list', () => {
		const wrapper = render(
			<ItemList items={ items } />
		);

		expect(wrapper.find('.item.list>.item').length).toEqual(2);	
	});

	
});
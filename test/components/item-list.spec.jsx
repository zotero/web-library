'use strict';

const assert = require('chai').assert;
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

		assert.equal(wrapper.find('.item.list>.item').length, 2);
	});
});

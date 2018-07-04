'use strict';

const assert = require('chai').assert;
const React = require('react');
const { shallow } = require('enzyme');
const ItemDetails = require('../../src/js/component/item/details');
const itemsFixture = require('../fixtures/items');


describe('<ItemDetails />', () => {
	var items;

	beforeEach(() => {
		items = itemsFixture.map(i => ({
			...i.data,
			...i.meta
		}));
	});

	it('renders details pane with tabs when one item is selected', () => {
		const wrapper = shallow(
			<ItemDetails item={ items[0] } />
		);

		assert.lengthOf(wrapper.find('ItemDetailsTabs'), 1);
		assert.lengthOf(wrapper.find('ItemDetailsInfoSelected'), 0);
		assert.lengthOf(wrapper.find('ItemDetailsInfoView'), 0);
	});

	it('renders details pane showing how many items selected when multiple items are selected', () => {
		const wrapper = shallow(
			<ItemDetails selectedItemKeys={ ['AAAAAAAA', 'BBBBBBBB'] } />
		);

		assert.lengthOf(wrapper.find('ItemDetailsTabs'), 0);
		assert.lengthOf(wrapper.find('ItemDetailsInfoSelected'), 1);
		assert.lengthOf(wrapper.find('ItemDetailsInfoView'), 0);
	});

	it('renders details pane showing how many items visible when no item is selected', () => {
		const wrapper = shallow(
			<ItemDetails />
		);

		assert.lengthOf(wrapper.find('ItemDetailsTabs'), 0);
		assert.lengthOf(wrapper.find('ItemDetailsInfoSelected'), 0);
		assert.lengthOf(wrapper.find('ItemDetailsInfoView'), 1);
	});
});

'use strict';

const React = require('react');
const { render } = require('enzyme');
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

	it('renders tabs & tab contents', () => {
		const wrapper = render(
			<ItemDetails item={ items[0] } />
		);

		expect(wrapper.find('.item.details>.panel>.panel-header .tabs>.tab').length).toEqual(5);
		expect(wrapper.find('.item.details>.panel>.panel-body>.tab-pane').length).toEqual(5);
		expect(wrapper.find('.item.details>.panel>.panel-header .tabs>.tab.active>a').text()).toEqual('Info');
		expect(wrapper.find('.item.details>.panel>.panel-body>.tab-pane.info.active').length).toEqual(1);
	});	
});
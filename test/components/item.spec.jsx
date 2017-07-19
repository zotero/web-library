'use strict';

const React = require('react');
const { render } = require('enzyme');
const Item = require('../../src/js/component/item');
const itemsFixture = require('../fixtures/items');
const moment = require('moment');


describe('<Item />', () => {
	var items;
	
	beforeEach(() => {
		items = itemsFixture.map(i => ({
			...i.data,
			...i.meta
		}));
	});

	it('renders title, author, year and date modified', () => {
		const wrapper = render(
			<Item item={ items[0] } />
		);

		expect(wrapper.find('li.item>div.title').text()).toEqual('document-2');
		expect(wrapper.find('li.item>div.author').text()).toEqual('Loremus');
		expect(wrapper.find('li.item>div.year').text()).toEqual('2006');
		expect(wrapper.find('li.item>div.date-modified').text())
			.toEqual(moment('2016-10-20T12:09:14Z').format('YYYY-MM-DD HH:mm'));
	});	
});
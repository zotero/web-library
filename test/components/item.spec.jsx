'use strict';

const assert = require('chai').assert;
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

		assert.equal(wrapper.find('li.item>div.title').text(), 'document-2');
		assert.equal(wrapper.find('li.item>div.author').text(), 'Loremus');
		assert.equal(wrapper.find('li.item>div.year').text(), '2006');
			assert.equal(wrapper.find('li.item>div.date-modified').text(), moment('2016-10-20T12:09:14Z').format('YYYY-MM-DD HH:mm'));
	});	
});
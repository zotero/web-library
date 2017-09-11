'use strict';

const assert = require('chai').assert;
const React = require('react');
const { render } = require('enzyme');
const ItemBox = require('../../src/js/component/item/box');
const itemsFixture = require('../fixtures/items');
const fieldsFixture = require('../fixtures/fields-document');

describe('<ItemBox />', () => {
	var items;
	
	beforeEach(() => {
		items = itemsFixture.map(i => ({
			...i.data,
			...i.meta
		}));
	});

	it('renders fields', () => {
		const fields = fieldsFixture.map(field =>({
			key: field.field,
			label: field.localized,
			value: field.field in items[0] ? items[0][field.field] : null
		}));

		const wrapper = render(
			<ItemBox item={ items[0] } fields={ fields } />
		);

		assert.equal(wrapper.find('.metadata-list>.metadata').length, 14);
		assert.equal(wrapper.find('.metadata-list>.metadata.empty').length, 12);
	});	
});
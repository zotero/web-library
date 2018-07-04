'use strict';

const assert = require('chai').assert;
const React = require('react');
const { shallow, render, mount } = require('enzyme');
const CollectionTree = require('../../src/js/component/collection-tree');
const collectionsFixture = require('../fixtures/collections');


describe('<CollectionTree />', () => {
	const collections = collectionsFixture.map(c => c.data);

	it('renders tree hierarchy', () => {
		const wrapper = shallow(
			<CollectionTree collections={ collections } />
		);
		// no path present, root should be active
		assert.equal(wrapper.find('div.level-root.active').length, 1);
		// just one level-1 with 3 top-level collections
		assert.equal(wrapper.find('div.level-1').length, 1);
		assert.equal(wrapper.find('div.level-1>ul>li.collection').length, 3);
		// one level-2 with 1 second-level collections
		assert.equal(wrapper.find('div.level-2').length, 1);
		assert.equal(wrapper.find('div.level-2>ul>li').length, 1);
	});

	it('renders .selected, .open and .has-open', () => {
		const wrapper = shallow(
			<CollectionTree
				path={ ['AAAAAAAA', 'AAAA0001'] }
				collections={ collections }
			/>
		);

		// console.log(wrapper.html());
		// path points to a subcollection, root should not be active
		assert.isNotOk(wrapper.find('div.level-root').hasClass('active'));

		assert.isNotOk(wrapper.find('div.level-1.has-open').hasClass('level-last'));
		assert.equal(wrapper.find('div.level-1>ul>li.open>.item-container a').text(), 'Test Collection A');
		assert.equal(wrapper.find('div.level-2.has-open.level-last').length, 1);
		assert.equal(wrapper.find('div.level-2>ul>li.selected').length, 1);
		assert.equal(wrapper.find('div.level-2>ul>li.selected>.item-container a').text(), 'Test Collection A1');
	});

	it('renders <Spinner /> when fetching', () => {
		const wrapper = shallow(
			<CollectionTree collections={ collections } isFetching={ true } />
		);

		assert.equal(wrapper.name(), 'Spinner');
	});
});

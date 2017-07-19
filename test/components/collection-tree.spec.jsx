'use strict';

const React = require('react');
const { shallow, render, mount } = require('enzyme');
const CollectionTree = require('../../src/js/component/collection-tree');
const collectionsFixture = require('../fixtures/collections');
const { enhanceCollections } = require('../../src/js/utils');


describe('<CollectionTree />', () => {
	var collections;
	beforeEach(() => {
		collections = enhanceCollections(collectionsFixture.map(c => c.data));
	});

	it('renders tree hierarchy', () => {
		const wrapper = render(
			<CollectionTree collections={ collections } />
		);
		// no path present, root should be active
		expect(wrapper.find('div.level-root.active').length).toEqual(1);
		// just one level-1 with 3 top-level collections
		expect(wrapper.find('div.level-1').length).toEqual(1);
		expect(wrapper.find('div.level-1>ul>li').length).toEqual(3);
		// one level-2 with 1 second-level collections
		expect(wrapper.find('div.level-2').length).toEqual(1);
		expect(wrapper.find('div.level-2>ul>li').length).toEqual(1);
	});

	it('renders .selected, .open and .has-open', () => {
		collections = enhanceCollections(
			collectionsFixture.map(c => c.data),
			['AAAAAAAA', 'AAAA0001']
		);
		const wrapper = render(
			<CollectionTree collections={ collections } />
		);

		// path points to a subcollection, root should not be active
		expect(wrapper.find('div.level-root:not(.active)').length).toEqual(1);
		expect(wrapper.find('div.level-1.has-open:not(.level-last)').length).toEqual(1);
		expect(wrapper.find('div.level-1>ul>li.open>.item-container a').text()).toEqual('Test Collection A');
		expect(wrapper.find('div.level-2.has-open.level-last').length).toEqual(1);
		expect(wrapper.find('div.level-2>ul>li.selected').length).toEqual(1);
		expect(wrapper.find('div.level-2>ul>li.selected>.item-container a').text()).toEqual('Test Collection A1');
	});

	it('renders <Spinner /> when fetching', () => {
		const wrapper = render(
			<CollectionTree collections={ collections } isFetching={ true } />
		);

		expect(wrapper.find('.icon-spin').length).toEqual(1);
	});
});
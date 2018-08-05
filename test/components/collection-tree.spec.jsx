'use strict';

const assert = require('chai').assert;
const React = require('react');
const { shallow } = require('enzyme');
const CollectionTree = require('../../src/js/component/collection-tree');
const Node = require('../../src/js/component/collection-tree/node');
const collectionsFixture = require('../fixtures/collections');


describe('<CollectionTree />', () => {
	const collections = collectionsFixture.map(c => c.data);
	const topLevelCollections = collections.filter(c => !c.parentCollection);

	it('renders tree hierarchy', () => {
		const wrapper = shallow(
			<CollectionTree collections={ collections } />
		);
		// no path present, root should be active
		assert.equal(wrapper.find('div.level-root.active').length, 1);
		// just one level-1 with 3 top-level collections
		assert.equal(wrapper.find('div.level-1').length, 1);
		assert.lengthOf(wrapper.find('div.level-1>ul').find(Node), topLevelCollections.length + 2);
		// one node with subcollections
		assert.lengthOf(
			wrapper.find('div.level-1>ul').findWhere(n => !!n.props().subtree),
		1);
	});

	it('renders .selected, .open and .has-open', () => {
		const wrapper = shallow(
			<CollectionTree
				path={ ['AAAAAAAA', 'AAAA0001'] }
				collections={ collections }
			/>
		);

		// path points to a subcollection, root should not be active
		assert.isNotOk(wrapper.find('div.level-root').hasClass('active'));
		assert.isNotOk(wrapper.find('div.level-1.has-open').hasClass('level-last'));
		assert.strictEqual(wrapper.find('div.level-1 > ul').find('[isOpen=true]').props().label, 'Test Collection A');

		let nodeWithSubTree = wrapper.find('div.level-1>ul').findWhere(n => !!n.props().subtree);
		let subtreeWrapper = shallow(nodeWithSubTree.props().subtree);
		assert.lengthOf(subtreeWrapper.find('div.level-2.has-open.level-last'), 1);
		assert.strictEqual(subtreeWrapper.find('div.level-2 > ul').find(Node).props().label, 'Test Collection A1');
		assert.include(
			subtreeWrapper.find('div.level-2 > ul').find(Node).props().className,
			'selected'
		);
	});

	it('renders <Spinner /> when fetching', () => {
		const wrapper = shallow(
			<CollectionTree collections={ collections } isFetching={ true } />
		);

		assert.equal(wrapper.name(), 'Spinner');
	});
});

import React from 'react';
import renderer from 'react-test-renderer';

import TagSelector from '../src/js/component/tag-selector';
import tags from './fixtures/tags.json';

const mapCollectionsRecursive = (col, f) => {
	return col.map(c => {
		c = f(c);
		if(c.children.length) {
			c.children = mapCollectionsRecursive(c.children, f);
		}
		return c;
	});
};

it('Renders tag selector with multiple tags', () => {
	let tree = renderer.create(
		<TagSelector tags = { tags } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders tag selector with a search string', () => {
	let tree = renderer.create(
		<TagSelector tags = { tags.filter(t => t.name.includes('tag')) } searchString="tag" />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

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

it('Renders tags correctly', () => {
	let tree = renderer.create(
		<TagSelector tags = { tags } />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

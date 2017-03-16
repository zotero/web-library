import React from 'react';
import renderer from 'react-test-renderer';

import Icon from '../src/js/component/ui/icon';

it('Renders icon', () => {
	let tree = renderer.create(
		<Icon type="cog" />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders icon from a subfolder', () => {
	let tree = renderer.create(
		<Icon type="16/folder" />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders icon with aria label', () => {
	let tree = renderer.create(
		<Icon type="cog" label="A cog icon" />
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders icon with dimensions', () => {
	let tree = renderer.create(
		<Icon type="cog" width="142" height="142" />
	).toJSON();
	expect(tree).toMatchSnapshot();
});
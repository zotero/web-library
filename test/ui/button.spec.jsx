import React from 'react';
import renderer from 'react-test-renderer';

import Button from '../../src/js/component/ui/button';
import Icon from '../../src/js/component/ui/icon';

it('Renders button', () => {
	let tree = renderer.create(
		<Button>Lorem Foo</Button>
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders button with an icon', () => {
	let tree = renderer.create(
		<Button>
			<Icon type="16/folder" />
		</Button>
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders button with an icon and Text', () => {
	let tree = renderer.create(
		<Button>
			<Icon type="16/folder" /> Foo
		</Button>
	).toJSON();
	expect(tree).toMatchSnapshot();
});


it('Renders active button', () => {
	let tree = renderer.create(
		<Button onClick={ () => {} } active={ true }>
			Ipsum Bar
		</Button>
	).toJSON();
	expect(tree).toMatchSnapshot();
});
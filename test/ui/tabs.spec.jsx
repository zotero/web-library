import React from 'react';
import renderer from 'react-test-renderer';

import { Tab, Tabs } from '../../src/js/component/ui/tabs';

it('Renders tabs', () => {
	let tree = renderer.create(
		<Tabs>
			<Tab onActivate={ () => {} } isActive>Active</Tab>
			<Tab onActivate={ () => {} }>Not Active</Tab>
		</Tabs>
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders tabs justified', () => {
	let tree = renderer.create(
		<Tabs justified>
			<Tab onActivate={ () => {} }>Lorem</Tab>
			<Tab onActivate={ () => {} }>Ipsum</Tab>
		</Tabs>
	).toJSON();
	expect(tree).toMatchSnapshot();
});

it('Renders tabs compact', () => {
	let tree = renderer.create(
		<Tabs compact>
			<Tab onActivate={ () => {} }>Lorem</Tab>
			<Tab onActivate={ () => {} }>Ipsum</Tab>
		</Tabs>
	).toJSON();
	expect(tree).toMatchSnapshot();
});
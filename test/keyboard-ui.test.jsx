/*
* @jest-environment ./test/utils/zotero-css-env.js
*/
import React from 'react';
import '@testing-library/jest-dom';
import { getByRole, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';

const state = JSONtoState(stateRaw);

// these tests include styles which makes them very slow
applyAdditionalJestTweaks({ timeout: 240000 });

test('Tabulate through the UI', async () => {
	delete window.location;
	window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	const user = userEvent.setup()
	renderWithProviders(<MainZotero />, { preloadedState: state, includeStyles: true });

	await waitForPosition();
	expect(screen.getByRole('searchbox', { name: 'Title, Creator, Year' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('treeitem', { name: 'My Library' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('button', { name: 'Collapse Tag Selector' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('button', { name: 'cute' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('searchbox', { name: 'Filter Tags' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('button', { name: 'New Item' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('tab', { name: 'Info' })).toHaveFocus();

	await user.keyboard('{tab}');
	const inputTypeCombo = screen.getByRole('combobox', { name: 'Item Type' });
	expect(getByRole(inputTypeCombo, 'textbox')).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();

	await user.keyboard('{tab}');
	expect(screen.getAllByRole('combobox', { name: 'Creator Type' }).shift()).toHaveFocus();
});



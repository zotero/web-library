/*
* @jest-environment ./test/utils/zotero-css-env.js
*/
import '@testing-library/jest-dom';
import { getByRole, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';

const state = JSONtoState(stateRaw);

// these tests include styles which makes them very slow
applyAdditionalJestTweaks({ timeout: 240000 });

test('Tabulate back through the UI', async () => {
	delete window.location;
	window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details');
	const user = userEvent.setup()
	renderWithProviders(<MainZotero />, { preloadedState: state, includeStyles: true });

	await waitForPosition();
	await user.click(screen.getByRole('textbox', { name: 'Title' }));
	expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	const inputTypeCombo = screen.getByRole('combobox', { name: 'Item Type' });
	expect(getByRole(inputTypeCombo, 'textbox')).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('tab', { name: 'Info' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('button', { name: 'New Item' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('searchbox', { name: 'Filter Tags' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('button', { name: 'cute' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('button', { name: 'Collapse Tag Selector' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('treeitem', { name: 'My Library' })).toHaveFocus();

	await user.keyboard('{shift>}{tab}{/shift}');
	expect(screen.getByRole('searchbox', { name: 'Title, Creator, Year' })).toHaveFocus();
});



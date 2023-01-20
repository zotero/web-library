/*
* @jest-environment ./test/utils/zotero-env.js
*/
import React from 'react';
import '@testing-library/jest-dom';
import { screen, getByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';

const state = JSONtoState(stateRaw);

// these tests include styles which makes them very slow
applyAdditionalJestTweaks({ timeout: 240000 });

test('Navigate through the toolbar and items table using keyboard', async () => {
	delete window.location;
	window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	const user = userEvent.setup()
	renderWithProviders(<MainZotero />, { preloadedState: state, includeStyles: true });
	await waitForPosition();

	const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });

	screen.getByRole('button', { name: 'New Item' }).focus();

	await user.keyboard('{arrowleft}');
	expect(getByRole(toolbar, 'button', { name: 'Column Selector' })).toHaveFocus();

	await user.keyboard('{arrowleft}');
	expect(getByRole(toolbar, 'button', { name: 'More' })).toHaveFocus();
});

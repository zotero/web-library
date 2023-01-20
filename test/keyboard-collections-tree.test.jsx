/*
* @jest-environment ./test/utils/zotero-env.js
*/
import React from 'react';
import '@testing-library/jest-dom';
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';

const state = JSONtoState(stateRaw);

// these tests include styles which makes them very slow
applyAdditionalJestTweaks({ timeout: 240000 });

test('Navigate through collections tree using keyboard', async () => {
	delete window.location;
	window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	const user = userEvent.setup()
	renderWithProviders(<MainZotero />, { preloadedState: state, includeStyles: true });
	await waitForPosition();

	act(() => screen.getByRole('treeitem', { name: 'My Library' }).focus());
	await user.keyboard('{arrowright}');

	expect(screen.getByRole('button', { name: 'Add Collection' })).toHaveFocus();

	await user.keyboard('{arrowleft}{arrowdown}');

	expect(screen.getByRole('treeitem', { name: 'AI' })).toHaveFocus();
});

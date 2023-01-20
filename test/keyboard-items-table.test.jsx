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

test('Navigate through items table using keyboard', async () => {
	delete window.location;
	window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	const user = userEvent.setup()
	renderWithProviders(<MainZotero />, { preloadedState: state, includeStyles: true });
	await waitForPosition();

	act(() => screen.getByRole('row',
		{ name: 'Effects of diet restriction on life span and age-related changes in dogs' }
		).focus()
	);

	await user.keyboard('{arrowdown}');

	expect(
		screen.getByRole('row', { name: 'Genius of Dogs: Discovering The Unique Intelligence Of Man\'s Best Friend: Amazon.co.uk: Hare, Brian, Woods, Vanessa: 9781780743684: Books' })
	).toHaveFocus();

	await user.keyboard('{arrowup}{arrowup}{arrowup}');

	expect(
		screen.getByRole('columnheader', { name: 'Title' })
	).toHaveFocus();

	await user.keyboard('{arrowright}');

	expect(
		screen.getByRole('columnheader', { name: 'Creator' })
	).toHaveFocus();
});

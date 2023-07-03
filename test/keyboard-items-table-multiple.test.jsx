/*
* @jest-environment ./test/utils/zotero-css-env.js
*/
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

test('Select multiple items using keyboard', async () => {
	delete window.location;
	window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	const user = userEvent.setup()
	renderWithProviders(<MainZotero />, { preloadedState: state });
	await waitForPosition();

	act(() => screen.getByRole('row',
		{ name: 'Effects of diet restriction on life span and age-related changes in dogs' }
	).focus()
	);

	await user.keyboard('{Shift>}{arrowdown}{arrowdown}{/Shift}');

	expect(await screen.findAllByRole('row', { selected: true })).toHaveLength(3);
	expect(screen.getByText('3 items selected')).toBeInTheDocument();

	await user.keyboard('{Shift>}{arrowup}{/Shift}');

	expect(await screen.findAllByRole('row', { selected: true })).toHaveLength(2);
	expect(screen.getByText('2 items selected')).toBeInTheDocument();
});

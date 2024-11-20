/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { act, fireEvent, getByRole, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks } from './utils/common';
import stateLibraryView from './fixtures/state/desktop-test-user-library-view.json';

const libraryViewState = JSONtoState(stateLibraryView);
applyAdditionalJestTweaks();

describe('User Type', () => {
	const handlers = [];
	const server = setupServer(...handlers)

	beforeAll(() => {
		server.listen({
			onUnhandledRequest: (req) => {
				// https://github.com/mswjs/msw/issues/946#issuecomment-1202959063
				test(`${req.method} ${req.url} is not handled`, () => { });
			},
		});
	});

	beforeEach(() => {
		delete window.location;
		window.location = new URL('http://localhost/');
	});

	afterEach(() => {
		server.resetHandlers()
		localStorage.clear();
	});

	afterAll(() => server.close());

	test('Switch the user type based on the pointing device used', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		const searchBoxEl = await screen.findByRole('searchbox', { name: 'Title, Creator, Year' });

		expect(window.document.documentElement).toHaveClass('mouse');

		await act(async () => {
			fireEvent['touchStart'](searchBoxEl);
			fireEvent['touchEnd'](searchBoxEl);
		});

		expect(window.document.documentElement).toHaveClass('touch');
		expect(window.document.documentElement).not.toHaveClass('mouse');

		// Wait a bit so that the mouse event is not discarded
		// (mouse events detected very soon after a touch event are discarded as simulated mouse events)
		await new Promise(res => setTimeout(res, 1000));
		await userEvent.click(searchBoxEl);
		await waitFor(() => expect(window.document.documentElement).toHaveClass('mouse'));
		expect(window.document.documentElement).not.toHaveClass('touch');
	});

	test('Ignore pointing device used if density preference is set to mouse', async () => {
		localStorage.setItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', density: 'mouse' }));
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		const searchBoxEl = await screen.findByRole('searchbox', { name: 'Title, Creator, Year' });

		expect(window.document.documentElement).toHaveClass('mouse');

		await act(async () => {
			fireEvent['touchStart'](searchBoxEl);
			fireEvent['touchEnd'](searchBoxEl);
		});

		expect(window.document.documentElement).toHaveClass('mouse');
		expect(window.document.documentElement).not.toHaveClass('touch');
	});

	test('Ignore pointing device used if density preference is set to touch', async () => {
		localStorage.setItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', density: 'touch' }));
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		const searchBoxEl = await screen.findByRole('searchbox', { name: 'Title, Creator, Year' });

		expect(window.document.documentElement).toHaveClass('touch');

		await userEvent.click(searchBoxEl);

		expect(window.document.documentElement).toHaveClass('touch');
		expect(window.document.documentElement).not.toHaveClass('mouse');
	});

	test("Switch density after preference change to touch", async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		expect(window.document.documentElement).toHaveClass('mouse');
		const settingsButtonEl = await screen.findByRole('button', { name: 'Open Settings' });
		await user.click(settingsButtonEl);
		const densityComboBox = await screen.findByRole('combobox', { name: 'UI Density' });
		await user.click(densityComboBox);
		await user.selectOptions(getByRole(densityComboBox, 'listbox'), 'Touch');
		expect(window.document.documentElement).toHaveClass('touch');
	});

	test("Switch density after preference change to mouse", async () => {
		localStorage.setItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', density: 'touch' }));
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });

		expect(window.document.documentElement).toHaveClass('touch');

		const settingsButtonEl = await screen.findByRole('button', { name: 'Open Settings' });
		await act(async () => {
			fireEvent['touchStart'](settingsButtonEl);
			fireEvent['touchEnd'](settingsButtonEl);
			fireEvent['click'](settingsButtonEl);
		});

		expect(window.document.documentElement).toHaveClass('touch');

		const densityComboBox = await screen.findByRole('combobox', { name: 'UI Density' });

		await userEvent.selectOptions(densityComboBox, 'Mouse');
		expect(window.document.documentElement).toHaveClass('mouse');
	});
});

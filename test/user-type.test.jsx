/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { act, fireEvent, getByRole, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState, getStateWithout } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateLibraryView from './fixtures/state/desktop-test-user-library-view.json';
import { mockMatchMedia } from './mocks/matchmedia';

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
		window.jsdom.reconfigure({ url: 'http://localhost/testuser' });
	});

	afterEach(() => {
		server.resetHandlers()
		localStorage.clear();
		delete window.matchMedia;
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

	test("It should opt for touch interface on device that reports touch pointer", async () => {
		mockMatchMedia({ isTouch: true, isMouse: false });
		renderWithProviders(<MainZotero />, { preloadedState: getStateWithout(libraryViewState, 'device') });
		await waitForPosition();
		expect(window.document.documentElement).toHaveClass('touch');
	});

	test("It should opt for mouse interface on device that reports mouse pointer", async () => {
		mockMatchMedia({ isTouch: false, isMouse: true });
		renderWithProviders(<MainZotero />, { preloadedState: getStateWithout(libraryViewState, 'device') });
		await waitForPosition();
		expect(window.document.documentElement).toHaveClass('mouse');
	});

	test("It should opt for mouse interface on Windows device that reports both touch and mouse pointers", async () => {
		jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
		mockMatchMedia({ isTouch: true, isMouse: true, isPrimaryMouse: false, isPrimaryTouch: true });
		renderWithProviders(<MainZotero />, { preloadedState: getStateWithout(libraryViewState, 'device') });
		await waitForPosition();
		expect(window.document.documentElement).toHaveClass('mouse');
	});

	test("It should opt for touch interface on iOS device that reports both touch and mouse pointers", async () => {
		jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPad; CPU OS 17_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1');
		mockMatchMedia({ isTouch: true, isMouse: true, isPrimaryMouse: false, isPrimaryTouch: true });
		renderWithProviders(<MainZotero />, { preloadedState: getStateWithout(libraryViewState, 'device') });
		await waitForPosition();
		expect(window.document.documentElement).toHaveClass('touch');
	});
});

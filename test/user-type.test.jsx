/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState, getStateWithout } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { getLSItem, setLSItem } from '../src/js/common/local-storage';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import stateLibraryView from './fixtures/state/desktop-test-user-library-view.json';
import { mockMatchMedia } from './mocks/matchmedia';

const libraryViewState = JSONtoState(stateLibraryView);
applyAdditionalJestTweaks();

describe('User Type', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	setupMSWLifecycle(server);

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/testuser' });
	});

	afterEach(() => {
		localStorage.clear();
		delete window.matchMedia;
	});

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
		setLSItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', density: 'mouse' }));
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

	test('Drop a stored touch density preference and follow the pointing device used', async () => {
		setLSItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', density: 'touch', colorScheme: 'dark' }));
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		const searchBoxEl = await screen.findByRole('searchbox', { name: 'Title, Creator, Year' });

		const storedPreferences = JSON.parse(getLSItem('zotero-web-library-prefs'));
		expect(storedPreferences).not.toHaveProperty('density');
		expect(storedPreferences.colorScheme).toBe('dark');
		expect(window.document.documentElement).toHaveClass('mouse');
		expect(window.document.documentElement).not.toHaveClass('touch');

		await act(async () => {
			fireEvent['touchStart'](searchBoxEl);
			fireEvent['touchEnd'](searchBoxEl);
		});

		expect(window.document.documentElement).toHaveClass('touch');
		expect(window.document.documentElement).not.toHaveClass('mouse');
	});

	test("Switch to mouse interface when Prefer Desktop UI is switched on and back when switched off", async () => {
		mockMatchMedia({ isTouch: true, isMouse: false });
		renderWithProviders(<MainZotero />, { preloadedState: getStateWithout(libraryViewState, 'device') });
		await waitForPosition();
		expect(window.document.documentElement).toHaveClass('touch');

		// fireEvent.click skips mousedown, which would switch to the mouse interface on its own
		fireEvent['click'](await screen.findByRole('button', { name: 'Open Settings' }));
		const desktopUISwitch = await screen.findByRole('switch', { name: 'Prefer Desktop UI' });

		await act(async () => fireEvent['click'](desktopUISwitch));
		await waitFor(() => expect(window.document.documentElement).toHaveClass('mouse'));
		expect(window.document.documentElement).not.toHaveClass('touch');

		await act(async () => fireEvent['click'](desktopUISwitch));
		await waitFor(() => expect(window.document.documentElement).toHaveClass('touch'));
		expect(window.document.documentElement).not.toHaveClass('mouse');
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

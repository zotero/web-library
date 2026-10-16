/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { getLSItem, setLSItem } from '../src/js/common/local-storage';
import { applyAdditionalJestTweaks } from './utils/common';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import stateLibraryView from './fixtures/state/desktop-test-user-library-view.json';
import { mockMatchMedia } from './mocks/matchmedia';

const libraryViewState = JSONtoState(stateLibraryView);
applyAdditionalJestTweaks();

const getStoredPreference = name => JSON.parse(getLSItem('zotero-web-library-prefs'))[name];

describe('Settings', () => {
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

	test('Color Scheme switch reflects the system color scheme and clears the override when switched back', async () => {
		const user = userEvent.setup();
		mockMatchMedia({ isDark: true });
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));

		const colorSchemeSwitch = await screen.findByRole('switch', { name: 'Color Scheme' });
		expect(colorSchemeSwitch).toHaveAccessibleDescription('On uses the dark scheme');
		expect(colorSchemeSwitch).toBeChecked();
		expect(document.documentElement.dataset.colorScheme).toBeUndefined();

		await user.click(colorSchemeSwitch);
		await waitFor(() => expect(getStoredPreference('colorScheme')).toBe('light'));
		expect(colorSchemeSwitch).not.toBeChecked();
		expect(document.documentElement.dataset.colorScheme).toBe('light');

		await user.click(colorSchemeSwitch);
		await waitFor(() => expect(getStoredPreference('colorScheme')).toBe(''));
		expect(colorSchemeSwitch).toBeChecked();
		expect(document.documentElement.dataset.colorScheme).toBeUndefined();
	});

	test('Color Scheme switch reflects a stored color scheme that differs from the system', async () => {
		const user = userEvent.setup();
		mockMatchMedia({ isDark: false });
		setLSItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', colorScheme: 'dark' }));
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));

		const colorSchemeSwitch = await screen.findByRole('switch', { name: 'Color Scheme' });
		expect(colorSchemeSwitch).toBeChecked();
		expect(document.documentElement.dataset.colorScheme).toBe('dark');

		await user.click(colorSchemeSwitch);
		await waitFor(() => expect(getStoredPreference('colorScheme')).toBe(''));
		expect(colorSchemeSwitch).not.toBeChecked();
		expect(document.documentElement.dataset.colorScheme).toBeUndefined();
	});

	test('Prefer Desktop UI switch overrides the detected touch interface until switched off', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));
		const desktopUISwitch = await screen.findByRole('switch', { name: 'Prefer Desktop UI' });

		await act(async () => {
			fireEvent.touchStart(desktopUISwitch);
			fireEvent.touchEnd(desktopUISwitch);
		});
		expect(document.documentElement).toHaveClass('touch');
		expect(desktopUISwitch).not.toBeChecked();

		// fireEvent.click skips mousedown, which would switch to the mouse interface on its own
		fireEvent.click(desktopUISwitch);
		await waitFor(() => expect(getStoredPreference('density')).toBe('mouse'));
		expect(desktopUISwitch).toBeChecked();
		expect(document.documentElement).toHaveClass('mouse');
		expect(document.documentElement).not.toHaveClass('touch');

		fireEvent.click(desktopUISwitch);
		await waitFor(() => expect(getStoredPreference('density')).toBeUndefined());
		expect(desktopUISwitch).not.toBeChecked();
		expect(document.documentElement).toHaveClass('touch');
		expect(document.documentElement).not.toHaveClass('mouse');
	});

	test('Prefer Desktop UI switch restores the detected interface after keyboard use', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));
		const desktopUISwitch = await screen.findByRole('switch', { name: 'Prefer Desktop UI' });

		await user.keyboard('{Tab}');
		expect(document.documentElement).toHaveClass('keyboard');
		expect(document.documentElement).toHaveClass('mouse');

		act(() => desktopUISwitch.focus());
		await user.keyboard(' ');
		await waitFor(() => expect(getStoredPreference('density')).toBe('mouse'));
		await user.keyboard(' ');
		await waitFor(() => expect(getStoredPreference('density')).toBeUndefined());
		expect(document.documentElement).toHaveClass('mouse');
	});

	test('Prefer Desktop UI switch is hidden on small screens', async () => {
		const user = userEvent.setup();
		const originalInnerWidth = window.innerWidth;
		window.innerWidth = 600;
		try {
			renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
			await user.click(await screen.findByRole('button', { name: 'Open Settings' }));

			expect(await screen.findByRole('switch', { name: 'Color Scheme' })).toBeInTheDocument();
			expect(screen.queryByRole('switch', { name: 'Prefer Desktop UI' })).not.toBeInTheDocument();
			expect(screen.queryByText('Prefer Desktop UI')).not.toBeInTheDocument();
		} finally {
			window.innerWidth = originalInnerWidth;
		}
	});
});

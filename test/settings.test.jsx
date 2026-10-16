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
import stateItemView from './fixtures/state/desktop-test-user-item-view.json';
import { mockMatchMedia } from './mocks/matchmedia';

const libraryViewState = JSONtoState(stateLibraryView);
const itemViewState = JSONtoState(stateItemView);
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

	test('Stacked Layout switch stacks item details below the items on wide screens', async () => {
		const user = userEvent.setup();
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details' });
		renderWithProviders(<MainZotero />, { preloadedState: itemViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));
		const stackedLayoutSwitch = await screen.findByRole('switch', { name: 'Stacked Layout' });

		expect(stackedLayoutSwitch).toHaveAccessibleDescription('On shows item details below the item list');
		expect(stackedLayoutSwitch).toBeEnabled();
		expect(stackedLayoutSwitch).not.toBeChecked();
		expect(document.documentElement).not.toHaveClass('stacked-layout');
		// The app is aria-hidden while the modal is open
		expect(screen.queryByRole('button', { name: 'Show Empty Fields', hidden: true })).not.toBeInTheDocument();

		await user.click(stackedLayoutSwitch);
		await waitFor(() => expect(getStoredPreference('layout')).toBe('stacked'));
		expect(stackedLayoutSwitch).toBeChecked();
		expect(document.documentElement).toHaveClass('stacked-layout');
		expect(screen.getByRole('button', { name: 'Show Empty Fields', hidden: true })).toBeInTheDocument();

		await user.click(stackedLayoutSwitch);
		await waitFor(() => expect(getStoredPreference('layout')).toBeUndefined());
		expect(stackedLayoutSwitch).not.toBeChecked();
		expect(document.documentElement).not.toHaveClass('stacked-layout');
		expect(screen.queryByRole('button', { name: 'Show Empty Fields', hidden: true })).not.toBeInTheDocument();
	});

	test('Stacked Layout switch reflects a stored preference', async () => {
		const user = userEvent.setup();
		setLSItem('zotero-web-library-prefs', JSON.stringify({ version: '1.5.4', layout: 'stacked' }));
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));

		expect(await screen.findByRole('switch', { name: 'Stacked Layout' })).toBeChecked();
		expect(document.documentElement).toHaveClass('stacked-layout');
	});

	test('Stacked Layout switch is disabled on touch devices unless Prefer Desktop UI is on', async () => {
		const user = userEvent.setup();
		renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
		await user.click(await screen.findByRole('button', { name: 'Open Settings' }));
		const desktopUISwitch = await screen.findByRole('switch', { name: 'Prefer Desktop UI' });
		const stackedLayoutSwitch = await screen.findByRole('switch', { name: 'Stacked Layout' });

		await act(async () => {
			fireEvent.touchStart(desktopUISwitch);
			fireEvent.touchEnd(desktopUISwitch);
		});
		expect(document.documentElement).toHaveClass('touch');
		expect(stackedLayoutSwitch).toBeDisabled();

		// fireEvent.click skips mousedown, which would switch to the mouse interface on its own
		fireEvent.click(desktopUISwitch);
		await waitFor(() => expect(getStoredPreference('density')).toBe('mouse'));
		expect(stackedLayoutSwitch).toBeEnabled();

		fireEvent.click(stackedLayoutSwitch);
		await waitFor(() => expect(getStoredPreference('layout')).toBe('stacked'));
		expect(document.documentElement).toHaveClass('stacked-layout');

		fireEvent.click(desktopUISwitch);
		await waitFor(() => expect(getStoredPreference('density')).toBeUndefined());
		expect(document.documentElement).toHaveClass('touch');
		expect(document.documentElement).not.toHaveClass('stacked-layout');
		expect(stackedLayoutSwitch).toBeDisabled();
		expect(stackedLayoutSwitch).toBeChecked();
	});

	test('Prefer Desktop UI and Stacked Layout switches are hidden on small screens', async () => {
		const user = userEvent.setup();
		const originalInnerWidth = window.innerWidth;
		window.innerWidth = 600;
		try {
			renderWithProviders(<MainZotero />, { preloadedState: libraryViewState });
			await user.click(await screen.findByRole('button', { name: 'Open Settings' }));

			expect(await screen.findByRole('switch', { name: 'Color Scheme' })).toBeInTheDocument();
			expect(screen.queryByRole('switch', { name: 'Prefer Desktop UI' })).not.toBeInTheDocument();
			expect(screen.queryByText('Prefer Desktop UI')).not.toBeInTheDocument();
			expect(screen.queryByRole('switch', { name: 'Stacked Layout' })).not.toBeInTheDocument();
			expect(screen.queryByText('Stacked Layout')).not.toBeInTheDocument();
		} finally {
			window.innerWidth = originalInnerWidth;
		}
	});
});

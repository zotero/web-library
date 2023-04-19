/*
* @jest-environment ./test/utils/zotero-env.js
*/

import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, getByRole, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import testUserUpdateDateDMY from './fixtures/response/test-user-update-date-dmy.json';
import testUserUpdateDateMDY from './fixtures/response/test-user-update-date-mdy.json';
import testUserUpdateItemType from './fixtures/response/test-user-update-item-type.json';

const state = JSONtoState(stateRaw);

describe('Item info', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	applyAdditionalJestTweaks();

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
		window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Displays fields with accessible names', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		const titleField = screen.getByRole('textbox', { name: 'Title' });

		expect(titleField).toHaveTextContent('Effects of diet restriction on life span and age-related changes in dogs');
		await user.click(titleField);
		expect(await screen.findByRole('textbox', { name: 'Title' })).toHaveFocus();
		expect(await screen.findByRole('textbox',
			{ name: 'Title' })
		).toHaveValue('Effects of diet restriction on life span and age-related changes in dogs');
		expect(screen.getAllByRole('listitem', { name: 'Author' })).toHaveLength(10);
		expect(screen.getByRole('textbox',
			{ name: 'Publication' })
		).toHaveTextContent('Journal of the American Veterinary Medical Association');
		expect(screen.getByRole('textbox', { name: 'Series' })).toBeInTheDocument();
		expect(screen.getByRole('textbox', { name: 'Abstract' })).toBeInTheDocument();
	});

	test('It parses date as dmy in the UK', async () => {
		jest.spyOn(window.navigator, 'language', 'get').mockReturnValue('en-GB');
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		await user.click(screen.getByRole('textbox', { name: 'Date' }));
		expect(await screen.findByRole('textbox', { name: 'Date' })).toHaveFocus();

		let hasBeenPosted = false;
		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].date).toBe('2021-10-04');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserUpdateDateDMY);
					return res;
				});
			}),
		);

		await user.type(
			screen.getByRole('textbox', { name: 'Date' }),
			'04/10/21{enter}', { skipClick: true }
		);

		await waitFor(() => expect(screen.getByRole('textbox',
			{ name: 'Date' })
		).toHaveTextContent('2021-10-04'));

		expect(hasBeenPosted).toBe(true);
	});

	test('It parses date as mdy in the US', async () => {
		expect(window.navigator.language).toBe('en-US');
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		await user.click(screen.getByRole('textbox', { name: 'Date' }));
		expect(await screen.findByRole('textbox', { name: 'Date' })).toHaveFocus();

		let hasBeenPosted = false;
		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].date).toBe('2021-04-10');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserUpdateDateMDY);
					return res;
				});
			}),
		);

		await user.type(
			screen.getByRole('textbox', { name: 'Date' }),
			'04/10/21{enter}', { skipClick: true }
		);

		await waitFor(() => expect(screen.getByRole('textbox',
			{ name: 'Date' })
		).toHaveTextContent('2021-04-10'));

		expect(hasBeenPosted).toBe(true);
	});

	test('It understands month names in the date field', async () => {
		expect(window.navigator.language).toBe('en-US');
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		await user.click(screen.getByRole('textbox', { name: 'Date' }));
		expect(await screen.findByRole('textbox', { name: 'Date' })).toHaveFocus();

		let hasBeenPosted = false;
		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].date).toBe('2021-04-10');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserUpdateDateMDY);
					return res;
				});
			}),
		);

		//@TODO: day suiffixes, e.g. April 10th, 2021 should also work
		await user.type(
			screen.getByRole('textbox', { name: 'Date' }),
			'April 10, 2021', { skipClick: true }
		);

		expect(await screen.findByText('mdy')).toBeInTheDocument();
		await user.type(screen.getByRole('textbox', { name: 'Date' }) , '{enter}');
		await waitFor(() => expect(screen.queryByText('mdy')).not.toBeInTheDocument());

		await waitFor(() => expect(screen.getByRole('textbox',
			{ name: 'Date' })
		).toHaveTextContent('2021-04-10'));

		expect(hasBeenPosted).toBe(true);
	});

	test('It understands month names in polish in the date field', async () => {
		jest.spyOn(window.navigator, 'language', 'get').mockReturnValue('pl-PL');
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		await user.click(screen.getByRole('textbox', { name: 'Date' }));
		expect(await screen.findByRole('textbox', { name: 'Date' })).toHaveFocus();

		let hasBeenPosted = false;
		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].date).toBe('2021-10-04');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserUpdateDateDMY);
					return res;
				});
			}),
		);

		//@TODO: day suiffixes, e.g. "4ty Październik 2021" should also work
		await user.type(
			screen.getByRole('textbox', { name: 'Date' }),
			'4 Październik 2021', { skipClick: true }
		);

		expect(await screen.findByText('dmy')).toBeInTheDocument();
		await user.type(screen.getByRole('textbox', { name: 'Date' }), '{enter}');
		await waitFor(() => expect(screen.queryByText('dmy')).not.toBeInTheDocument());
		await waitFor(() => expect(screen.getByRole('textbox',
			{ name: 'Date' })
		).toHaveTextContent('2021-10-04'));

		expect(hasBeenPosted).toBe(true);
	});

	test('It should use base-type-mappings when changing item types', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false

		expect(await screen.findByRole('textbox',
			{ name: 'Publication' })
		).toHaveTextContent('Journal of the American Veterinary Medical Association');

		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].itemType).toBe('radioBroadcast');
				expect(items[0].programTitle).toBe('Journal of the American Veterinary Medical Association');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserUpdateItemType);
					return res;
				});
			}),
		);

		const inputTypeCombo = screen.getByRole('combobox', { name: 'Item Type' });
		await user.click(inputTypeCombo);
		await user.selectOptions(getByRole(inputTypeCombo, 'listbox'), 'Radio Broadcast');

		expect(await screen.findByRole('textbox',
			{ name: 'Program Title' })
		).toHaveTextContent('Journal of the American Veterinary Medical Association');
		expect(screen.queryByRole('textbox', { name: 'Publication' })).not.toBeInTheDocument();
		expect(hasBeenPosted).toBe(true);
	});
});

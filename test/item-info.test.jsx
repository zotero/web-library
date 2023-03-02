/*
* @jest-environment ./test/utils/zotero-env.js
*/

import React from 'react';
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';

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

});

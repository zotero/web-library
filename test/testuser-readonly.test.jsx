import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition, actWithFakeTimers, resizeWindow } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import itemFields from './fixtures/response/item-fields';
import itemTypeFieldsBook from './fixtures/response/item-type-fields-film.json';
import itemTypeCreatorTypesBook from './fixtures/response/item-type-creator-types-film.json';

// Force My Library to be read-only
stateRaw.config.libraries[0].isReadOnly = true;

const state = JSONtoState(stateRaw);
applyAdditionalJestTweaks();

describe('Test User\'s read-only library', () => {
	const handlers = [];
	const server = setupServer(...handlers)

	beforeAll(() => {
		server.listen({
			onUnhandledRequest: (req) => {
				// https://github.com/mswjs/msw/issues/946#issuecomment-1202959063
				test(`${req.method} ${req.url} is not handled`, () => { });
			},
		});
		resizeWindow(1280, 720);
	});

	beforeEach(() => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Should not attempt to run redundant image cleanup', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const noteItem = screen.getByRole('row', { name: 'Puppies!' });
		await actWithFakeTimers(user => user.click(noteItem));
		await waitForPosition();

		expect(screen.getByRole('tab', { name: 'Note', selected: true })).toBeInTheDocument();

		server.use(
			rest.get('https://api.zotero.org/creatorFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemFields);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemTypeCreatorTypes', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypeCreatorTypesBook);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/itemTypeFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(itemTypeFieldsBook);
					return res;
				});
			}),
		);

		const nextItem = screen.getByRole('row', { name: 'Understanding dogs' });
		await actWithFakeTimers(user => user.click(nextItem));
		await waitForPosition();
	});
});

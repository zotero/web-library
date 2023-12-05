/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getAllByRole, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import userPicturesRedundant from './fixtures/response/test-user-pictures-redundant.json';
import creatorFields from './fixtures/response/creator-fields';
import itemTypeFieldsBook from './fixtures/response/item-type-fields-book.json';
import itemTypeCreatorTypesBook from './fixtures/response/item-type-creator-types-book.json';
import newItemNote from './fixtures/response/new-item-note.json';
import testUserAddNewItem from './fixtures/response/test-user-add-new-item.json';
import testUserAddNewItemNote from './fixtures/response/test-user-add-new-item-note.json';

const state = JSONtoState(stateRaw);

describe('Test User\'s library', () => {
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

	test('Run redundant image cleanup', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const noteItem = screen.getByRole('row', { name: 'Puppies!' });
		await userEvent.click(noteItem);
		await waitForPosition();

		expect(screen.getByRole('tab',
			{ name: 'Note', selected: true }
		)).toBeInTheDocument();

		let hasBeenDeleted = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items/Z6HA62VJ/children', () => {
				return HttpResponse.json(userPicturesRedundant, {
					headers: { 'Total-Results': 4 }
				});
			}),
			http.delete('https://api.zotero.org/users/1/items', ({request}) => {
				const url = new URL(request.url);
				const itemKey = url.searchParams.get('itemKey');
				expect(itemKey).toBe('ZZZZZZZZ');
				hasBeenDeleted = true;
				return new HttpResponse(null, { status: 204 });
			}),
			http.get('https://api.zotero.org/creatorFields', () => {
				return HttpResponse.json(creatorFields);
			}),
			http.get('https://api.zotero.org/itemTypeCreatorTypes', () => {
				return HttpResponse.json(itemTypeCreatorTypesBook);
			}),
			http.get('https://api.zotero.org/itemTypeFields', () => {
				return HttpResponse.json(itemTypeFieldsBook);
			}),
		);

		const nextItem = screen.getByRole('row', { name: 'Understanding dogs' });
		await userEvent.click(nextItem);
		await waitForPosition();

		expect(hasBeenDeleted).toBe(true);
	});

	test('Add a note using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		const addNoteBtn = screen.getByRole('button', { name: 'New Standalone Note' });
		let hasBeenPosted = false;

		server.use(
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				const itemKey = url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return HttpResponse.json(newItemNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toEqual('note');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewItem);
			}),
		);

		await userEvent.click(addNoteBtn);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(getAllByRole(gridBody, 'row')).toHaveLength(8));
	});

	test('Add a note using side panel', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		expect(screen.queryByRole('listitem', { name: 'Untitled Note' })).not.toBeInTheDocument();
		let hasBeenPosted = false;
		server.use(
			http.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': 0 }
				});
			}),
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				const itemKey = url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return HttpResponse.json(newItemNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items).toHaveLength(1);
				expect(items[0].itemType).toEqual('note');
				expect(items[0].parentItem).toEqual('VR82JUX8');
				expect(items[0].collections).toEqual([]);
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewItemNote);
			})
		);

		await userEvent.click(screen.getByRole('tab', { name: 'Notes' }));
		await screen.findByRole('button', { name: 'Add Note' });

		await userEvent.click(screen.getByRole('button', { name: 'Add Note' }));
		expect(hasBeenPosted).toBe(true);
		expect(await screen.findByRole('listitem',
			{ name: 'Untitled Note' })
		).toBeInTheDocument();
	});


});

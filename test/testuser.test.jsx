/*
* @jest-environment ./test/utils/zotero-env.js
*/

import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getByRole, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition, actWithFakeTimers } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import userPicturesRedundant from './fixtures/response/test-user-pictures-redundant.json';
import creatorFields from './fixtures/response/creator-fields';
import itemTypeFieldsBook from './fixtures/response/item-type-fields-book.json';
import itemTypeCreatorTypesBook from './fixtures/response/item-type-creator-types-book.json';
import responseAddItemToCollections from './fixtures/response/test-user-add-item-to-collection.json';
import newItemJournalArticle from './fixtures/response/new-item-journal-article.json';
import testUserAddNewItem from './fixtures/response/test-user-add-new-item.json';
import searchByIdentifier from './fixtures/response/search-by-identifier.json';
import responseAddByIdentifier from './fixtures/response/test-user-add-by-identifier.json';

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
		await actWithFakeTimers(user => user.click(noteItem));
		await waitForPosition();

		expect(screen.getByRole('tab',
			{ name: 'Note', selected: true }
		)).toBeInTheDocument();

		let hasBeenDeleted = false;

		server.use(
			rest.get('https://api.zotero.org/users/1/items/Z6HA62VJ/children', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 4);
					res.body = JSON.stringify(userPicturesRedundant);
					return res;
				});
			}),
			rest.delete('https://api.zotero.org/users/1/items', (req, res) => {
				const itemKey = req.url.searchParams.get('itemKey');
				expect(itemKey).toBe('ZZZZZZZZ');
				hasBeenDeleted = true;
				return res(res => {
					res.status = 204;
					return res;
				});
			}),
			rest.get('https://api.zotero.org/creatorFields', (req, res) => {
				return res(res => {
					res.body = JSON.stringify(creatorFields);
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

		expect(hasBeenDeleted).toBe(true);
	});

	test('Add new items using "plus" button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const plusBtn = screen.getByRole('button', { name: 'New Item' });
		await actWithFakeTimers(user => user.click(plusBtn));
		await waitForPosition();

		// menu should be open
		expect(screen.getByRole('button',
			{ name: 'New Item', expanded: true })
		).toBeInTheDocument();

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('journalArticle');
				return res(res => {
					res.body = JSON.stringify(newItemJournalArticle);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].itemType).toEqual('journalArticle');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserAddNewItem);
					return res;
				});
			}),
		);

		const itemTypeOpt = screen.getByRole('menuitem', { name: 'Journal Article' });
		await actWithFakeTimers(user => user.click(itemTypeOpt));
		await waitForPosition();

		// menu should be closed
		expect(screen.getByRole('button',
			{ name: 'New Item', expanded: false })
		).toBeInTheDocument();

		expect(hasBeenPosted).toBe(true);
	});

	test('Add new item using "Add By Identifier" button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const addBtn = screen.getByRole('button', { name: 'Add By Identifier' });
		await actWithFakeTimers(user => user.click(addBtn));
		await waitForPosition();

		expect(screen.getByRole('dialog',
			{ name: 'Add By Identifier' })
		).toBeInTheDocument();

		let hasBeenSearched = false;
		let hasBeenCreated = false;

		server.use(
			rest.post('https://translate-server.zotero.org/Prod/search', async (req, res) => {
				const identifier = await req.text();
				expect(identifier).toEqual('0312558066');
				hasBeenSearched = true;
				return res(res => {
					res.body = JSON.stringify(searchByIdentifier);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('UHRGBS8D');
				expect(items[0].ISBN).toBe('9780312558062');
				expect(items[0].collections).toEqual(["WTTJ2J56"]);
				hasBeenCreated = true;
				return res(res => {
					res.body = JSON.stringify(responseAddByIdentifier);
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

		const input = screen.getByRole('textbox',
			{ name: 'Enter a URL, ISBNs, DOIs, PMIDs, or arXiv IDs' }
		);

		await userEvent.type(
			input, '0312558066{enter}', { skipClick: true }
		);
		await waitForPosition();
		await screen.findByRole('row', { name: 'Hachiko waits' })

		expect(screen.queryByRole('dialog',
			{ name: 'Add By Identifier' }
		)).not.toBeInTheDocument();

		expect(hasBeenSearched).toBe(true);
		expect(hasBeenCreated).toBe(true);
	});

	test('Add item to a collection using modal', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const addToCollectionBtn = screen.getByRole('button',
			{ name: 'Add To Collection' }
		);

		await actWithFakeTimers(user => user.click(addToCollectionBtn));
		// await waitForPosition();

		const dialog = screen.getByRole('dialog', { name: 'Select Collection' });
		expect(dialog).toBeInTheDocument();

		expect(getByRole(dialog, 'button', { name: 'Close Dialog' })).toBeInTheDocument();

		const myLibraryNode = getByRole(dialog, 'treeitem', { name: 'My Library' });
		await actWithFakeTimers(user => user.click(
			getByRole(myLibraryNode, 'button', { name: 'Expand' })
		));

		// "Dogs" collection is disabled because current item is already in it
		expect(getByRole(dialog, 'treeitem',
			{ name: 'Dogs', expanded: false }
		)).toHaveAttribute('aria-disabled', 'true');

		// Add button is disabled because no collection is selected yet
		expect(getByRole(dialog, 'button',
			{ name: 'Add' }
		)).toBeDisabled();

		const musicNode = getByRole(dialog, 'treeitem', { name: 'Music' });
		await actWithFakeTimers(user => user.click(musicNode));

		const addBtn = getByRole(dialog, 'button',{ name: 'Add' });
		expect(addBtn).toBeEnabled();

		let hasBeenUpdated = false;

		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toBe('VR82JUX8');
				expect(items[0].collections).toEqual(["WTTJ2J56", "4VM2BFHN"]);

				hasBeenUpdated = true;
				return res(res => {
					res.body = JSON.stringify(responseAddItemToCollections);
					return res;
				});
			})
		);

		await actWithFakeTimers(user => user.click(addBtn));
		expect(hasBeenUpdated).toBe(true);
	});
});

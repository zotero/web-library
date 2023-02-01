/*
* @jest-environment ./test/utils/zotero-env.js
*/

import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { findByRole, getAllByRole, getByRole, screen, waitFor, queryByRole, queryAllByRole } from '@testing-library/react';
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
import responseAddItemToCollections from './fixtures/response/test-user-add-item-to-collection.json';
import newItemJournalArticle from './fixtures/response/new-item-journal-article.json';
import newItemNote from './fixtures/response/new-item-note.json';
import testUserAddNewItem from './fixtures/response/test-user-add-new-item.json';
import testUserAddNewItemNote from './fixtures/response/test-user-add-new-item-note.json';
import testUserRemoveItemFromCollection from './fixtures/response/test-user-remove-item-from-collection.json';
import testUserTrashItem from './fixtures/response/test-user-trash-item.json';
import searchByIdentifier from './fixtures/response/search-by-identifier.json';
import responseAddByIdentifier from './fixtures/response/test-user-add-by-identifier.json';
import testUserDuplicateItem from './fixtures/response/test-user-duplicate-item.json';
import testUserTagsSuggestions from './fixtures/response/test-user-tags-suggestions.json';
import testUserTagsForItem from './fixtures/response/test-user-tags-for-item.json';

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
		await userEvent.click(nextItem);
		await waitForPosition();

		expect(hasBeenDeleted).toBe(true);
	});

	test('Add new items using "plus" button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const plusBtn = screen.getByRole('button', { name: 'New Item' });
		await userEvent.click(plusBtn);
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
		await userEvent.click(itemTypeOpt);
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
		await userEvent.click(addBtn);
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

	test('Add a note using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		const addNoteBtn = screen.getByRole('button', { name: 'New Standalone Note' });
		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return res(res => {
					res.body = JSON.stringify(newItemNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].itemType).toEqual('note');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserAddNewItem);
					return res;
				});
			}),
		);

		await userEvent.click(addNoteBtn);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(getAllByRole(gridBody, 'row')).toHaveLength(8));
	});

	test('Add item to a collection using modal', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const addToCollectionBtn = screen.getByRole('button',
			{ name: 'Add To Collection' }
		);

		await userEvent.click(addToCollectionBtn);

		const dialog = screen.getByRole('dialog', { name: 'Select Collection' });
		expect(dialog).toBeInTheDocument();

		expect(getByRole(dialog, 'button', { name: 'Close Dialog' })).toBeInTheDocument();

		const myLibraryNode = getByRole(dialog, 'treeitem', { name: 'My Library' });
		await userEvent.click(getByRole(myLibraryNode, 'button', { name: 'Expand' }));

		// "Dogs" collection is disabled because current item is already in it
		expect(getByRole(dialog, 'treeitem',
			{ name: 'Dogs', expanded: false }
		)).toHaveAttribute('aria-disabled', 'true');

		// Add button is disabled because no collection is selected yet
		expect(getByRole(dialog, 'button',
			{ name: 'Add' }
		)).toBeDisabled();

		const musicNode = getByRole(dialog, 'treeitem', { name: 'Music' });
		await userEvent.click(musicNode);

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

		await userEvent.click(addBtn);
		expect(hasBeenUpdated).toBe(true);
	});

	test('Remove item from a colection using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return res(res => {
					res.body = JSON.stringify(newItemNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toEqual('VR82JUX8');
				expect(items[0].collections).toEqual([]);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserRemoveItemFromCollection);
					return res;
				});
			}),
		);

		const removeFromCollectionBtn = screen.getByRole('button',
			{ name: 'Remove From Collection' }
		);

		await userEvent.click(removeFromCollectionBtn);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(getAllByRole(gridBody, 'row')).toHaveLength(6));
	});

	test('Trash item using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const grid = screen.getByRole('grid', { name: 'items' });
		const gridBody = getByRole(grid, 'rowgroup');

		expect(getAllByRole(gridBody, 'row')).toHaveLength(7);

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return res(res => {
					res.body = JSON.stringify(newItemNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].key).toEqual('VR82JUX8');
				expect(items[0].deleted).toEqual(1);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserTrashItem);
					return res;
				});
			}),
		);

		const trashBtn = screen.getByRole('button',
			{ name: 'Move To Trash' }
		);

		await userEvent.click(trashBtn);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(getAllByRole(gridBody, 'row')).toHaveLength(6));
	});

	test('Duplicate item using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		expect(screen.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' })).toBeInTheDocument();

		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });

		const moreBtn = getByRole(toolbar, 'button', { name: 'More' });
		await userEvent.click(moreBtn);
		await waitForPosition();

		// menu should be open
		expect(getByRole(toolbar, 'button',
			{ name: 'More', expanded: true })
		).toBeInTheDocument();

		let hasBeenPosted = false;

		server.use(
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].title).toEqual('Effects of diet restriction on life span and age-related changes in dogs');
				expect(items[0].collections).toEqual(['WTTJ2J56']);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserDuplicateItem);
					return res;
				});
			})
		);

		const duplicateOpt = screen.getByRole('menuitem', { name: 'Duplicate Item' });

		await userEvent.click(duplicateOpt);
		expect(hasBeenPosted).toBe(true);
		await waitFor(() => expect(screen.getAllByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' })).toHaveLength(2));
	});

	test('Add a note using side panel', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		expect(screen.queryByRole('listitem', { name: 'Untitled Note' })).not.toBeInTheDocument();
		let hasBeenPosted = false;
		server.use(
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 0);
					res.body = JSON.stringify([]);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				const itemKey = req.url.searchParams.get('itemType');
				expect(itemKey).toBe('note');
				return res(res => {
					res.body = JSON.stringify(newItemNote);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items).toHaveLength(1);
				expect(items[0].itemType).toEqual('note');
				expect(items[0].parentItem).toEqual('VR82JUX8');
				expect(items[0].collections).toEqual([]);
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserAddNewItemNote);
					return res;
				});
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

	test('Add a tag by picking a suggestion in side panel', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();

		let postCounter = 0;
		server.use(
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 0);
					res.body = JSON.stringify([]);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/users/1/tags', (req, res) => {
				return res(res => {
					expect(req.url.searchParams.get('qmode')).toEqual('startswith');
					expect(req.url.searchParams.get('q')).toEqual('t');
					expect(req.url.searchParams.get('direction')).toEqual('asc');

					res.headers.set('Total-Results', 2);
					res.body = JSON.stringify(testUserTagsSuggestions);
					return res;
				});
			}),
			rest.patch('https://api.zotero.org/users/1/items/VR82JUX8', async (req, res) => {
				const patch = await req.json();
				postCounter++;
				if(postCounter === 1) {
					expect(patch.tags).toEqual([{ tag: 'to read' }]);
				} else {
					expect(patch.tags).toContainEqual({ tag: 'to read' });
					expect(patch.tags).toContainEqual({ tag: 'today' });
				}
				return res(res => {
					res.status = 204;
					return res;
				})
			}),
			rest.get('https://api.zotero.org/users/1/collections/WTTJ2J56/items/top/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 1);
					res.body = JSON.stringify(testUserTagsForItem);
					return res;
				})
			})
		);



		await user.click(screen.getByRole('tab', { name: 'Tags' }));
		await screen.findByRole('button', { name: 'Add Tag' });

		// item has no tags yet
		expect(screen.queryByRole('list', { name: 'Tags' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Add Tag' }));
		await screen.findByRole('textbox', { name: 'Tag Name' });
		await user.type(screen.getByRole('textbox', { name: 'Tag Name' }), 't');
		const suggestions1 = await screen.findByRole('listbox', { name: 'Suggestions' });
		await findByRole(suggestions1, 'listitem', { name: 'to read' });
		expect(queryAllByRole(suggestions1, 'listitem')).toHaveLength(2);

		await user.click(getByRole(suggestions1, 'listitem', { name: 'to read' }));
		expect(postCounter).toBe(1);

		// item has one tag now
		const list1 = await screen.findByRole('list', { name: 'Tags' });
		expect(await findByRole(list1, 'listitem', { name: 'to read' })).toBeInTheDocument();

		const tagInput = await screen.findByRole('textbox', { name: 'Tag Name' });
		expect(tagInput).toHaveFocus();
		await user.type(tagInput, 't');
		const suggestions2 = await screen.findByRole('listbox', { name: 'Suggestions' });
		await findByRole(suggestions2, 'listitem', { name: 'today' });

		// only one suggestion left (the other one is already added)
		expect(queryAllByRole(suggestions2, 'listitem')).toHaveLength(1); // eslint-disable-line jest-dom/prefer-in-document
		await user.keyboard('{arrowdown}{enter}');
		expect(postCounter).toBe(2);

		const list2 = await screen.findByRole('list', { name: 'Tags' });
		expect(await findByRole(list2, 'listitem', { name: 'to read' })).toBeInTheDocument();
		expect(await findByRole(list2, 'listitem', { name: 'today' })).toBeInTheDocument();
	});

});

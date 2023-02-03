/*
* @jest-environment ./test/utils/zotero-env.js
*/

import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { findByRole, getAllByRole, getByRole, screen, waitFor, queryByRole, queryAllByRole, prettyDOM } from '@testing-library/react';
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
import newItemFileAttachment from './fixtures/response/new-item-file-attachment.json';
import newItemLinkedAttachment from './fixtures/response/new-item-linked-attachment.json';
import testUserAddNewItem from './fixtures/response/test-user-add-new-item.json';
import testUserAddNewItemNote from './fixtures/response/test-user-add-new-item-note.json';
import testUserRemoveItemFromCollection from './fixtures/response/test-user-remove-item-from-collection.json';
import testUserTrashItem from './fixtures/response/test-user-trash-item.json';
import searchByIdentifier from './fixtures/response/search-by-identifier.json';
import responseAddByIdentifier from './fixtures/response/test-user-add-by-identifier.json';
import testUserDuplicateItem from './fixtures/response/test-user-duplicate-item.json';
import testUserTagsSuggestions from './fixtures/response/test-user-tags-suggestions.json';
import testUserTagsForItem from './fixtures/response/test-user-tags-for-item.json';
import testUserAddNewAttachmentFile from './fixtures/response/test-user-add-new-attachment-file.json';
import testUserAddAttachamentFileRefetchParent from './fixtures/response/test-user-add-attachment-file-refetch-parent.json';
import testUserAddNewLinkedURLAttachment from './fixtures/response/test-user-add-new-linked-url-attachment.json';
import testUserManageTags from './fixtures/response/test-user-manage-tags.json';

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
		expect(screen.getByText('0 tags')).toBeInTheDocument();
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
		expect(screen.getByText('1 tag')).toBeInTheDocument();

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
		expect(screen.getByText('2 tags')).toBeInTheDocument();
	});

	test('Add a file attachment using button in side pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false;
		let hasBeenUploaded = false;

		server.use(
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 0);
					res.body = JSON.stringify([]);
					return res;
				});
			}),
			rest.get('https://api.zotero.org/items/new', (req, res) => {
				expect(req.url.searchParams.get('itemType')).toBe('attachment');
				expect(req.url.searchParams.get('linkMode')).toBe('imported_file');
				return res(res => {
					res.body = JSON.stringify(newItemFileAttachment);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('imported_file');
				expect(items[0].parentItem).toBe('VR82JUX8');
				expect(items[0].filename).toBe('hello.pdf');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserAddNewAttachmentFile);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items/FFIILLEE/file', async (req, res) => {
				const body = await req.text();
				expect(body).toMatch(/filename=hello.pdf/);
				hasBeenUploaded = true;
				return res(res => {
					res.delay = 100; // ensure "ongoing" state is shown
					res.body = JSON.stringify({ exists: 1 });
					return res;
				});
			}),
			rest.get('https://api.zotero.org/users/1/items', (req, res) => {
				expect(req.url.searchParams.get('itemKey')).toBe('VR82JUX8');
				return res(res => {
					res.headers.set('Total-Results', 1);
					res.body = JSON.stringify(testUserAddAttachamentFileRefetchParent);
					return res;
				});
			})
		);

		await user.click(screen.getByRole('tab', { name: 'Attachments' }));
		await screen.findByRole('button', { name: 'Add File' });
		expect(await screen.findByText('0 attachments')).toBeInTheDocument();

		const input = screen.getByLabelText('Add File');
		const file = new File([1,1,1,1], 'hello.pdf', { type: 'application/pdf' })
		await userEvent.upload(input, file);

		expect(await screen.findByText('Uploading 1 file')).toBeInTheDocument();

		expect(await screen.findByText('1 attachment')).toBeInTheDocument();
		const listitem = await screen.findByRole('listitem', { name: 'hello.pdf' })

		await waitFor(() => expect(screen.queryByText('Uploading 1 file')).not.toBeInTheDocument());

		expect(await findByRole(listitem, 'button', { name: 'Open In Reader' })).toBeInTheDocument();
		expect(getByRole(listitem, 'button', { name: 'Export Attachment With Annotations' })).toBeInTheDocument();
		expect(getByRole(listitem, 'button', { name: 'Delete Attachment' })).toBeInTheDocument();
		expect(hasBeenPosted).toBe(true);
		expect(hasBeenUploaded).toBe(true);
	});

	test('Add a linked URL attachment using button in side pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
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
				expect(req.url.searchParams.get('itemType')).toBe('attachment');
				expect(req.url.searchParams.get('linkMode')).toBe('linked_url');
				return res(res => {
					res.body = JSON.stringify(newItemLinkedAttachment);
					return res;
				});
			}),
			rest.post('https://api.zotero.org/users/1/items', async (req, res) => {
				const items = await req.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('linked_url');
				expect(items[0].parentItem).toBe('VR82JUX8');
				expect(items[0].url).toBe('http://example.com/'); // auto-corrected into valid URL
				expect(items[0].title).toBe('Example');
				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserAddNewLinkedURLAttachment);
					return res;
				});
			})
		);

		await user.click(screen.getByRole('tab', { name: 'Attachments' }));
		await screen.findByRole('button', { name: 'Add Linked URL' });
		expect(await screen.findByText('0 attachments')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Add Linked URL' }));

		const linkInput = await screen.findByRole('textbox', { name: 'Link' });
		const titleInput = await screen.findByRole('textbox', { name: 'Title' });

		expect(linkInput).toHaveAttribute('aria-invalid', 'false');

		await user.type(linkInput, 'foo');
		await user.click(screen.getByRole('button', { name: 'Add' }));

		expect(linkInput).toHaveAttribute('aria-invalid', 'true');

		await user.clear(linkInput);
		await user.type(linkInput, 'example.com');
		await user.type(titleInput, 'Example');
		await user.click(screen.getByRole('button', { name: 'Add' }));

		expect(await screen.findByText('1 attachment')).toBeInTheDocument();
		const listitem = await screen.findByRole('listitem', { name: 'Example' });
		expect(listitem).toBeInTheDocument();
		expect(getByRole(listitem, 'button', { name: 'Open Linked Attachment' })).toHaveAttribute('href', 'http://example.com/');
		expect(getByRole(listitem, 'button', { name: 'Delete Attachment' })).toBeInTheDocument();
		expect(hasBeenPosted).toBe(true);
	});

	test('Add a color to a tag', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false;
		server.use(
			rest.get('https://api.zotero.org/users/1/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 8);
					res.body = JSON.stringify(testUserManageTags);
					return res;
				});
			}),
			rest.put('https://api.zotero.org/users/1/settings/tagColors', async (req, res) => {
				const tagColors = await req.json();
				expect(tagColors.value).toHaveLength(5);
				expect(tagColors.value).toContainEqual({
					'name': 'pathfinding',
					'color': '#A28AE5'
				});
				hasBeenPosted = true;
				return res(res => {
					res.status = 204;
					return res;
				});
			})
		);

		await user.click(screen.getByRole('button', { name: 'Tag Selector Options' }));
		const manageTagsOpt = await screen.findByRole('menuitem', { name: 'Manage Tags' });
		await user.click(manageTagsOpt);
		const manageTagsModal = await screen.findByRole('dialog', { name: 'Manage Tags' });
		const list = await findByRole(manageTagsModal, 'list', { name: 'Tags' });
		const tagItem = await findByRole(list, 'listitem', { name: 'pathfinding' });
		const moreButton = getByRole(tagItem, 'button', { name: 'More' });
		await user.click(moreButton);
		const assignColorOpt = await screen.findByRole('menuitem', { name: 'Assign Color' });
		await user.click(assignColorOpt);
		const colorComboBox = screen.getByRole('combobox', { name: 'Color' });
		await user.click(getByRole(colorComboBox, 'option', { name: 'violet' }));
		await userEvent.click(screen.getByRole('button', { name: 'Set Color' }));
		expect(hasBeenPosted).toBe(true);
	});

	test('Remove a color from a tag', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/users/1/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 8);
					res.body = JSON.stringify(testUserManageTags);
					return res;
				});
			}),
			rest.put('https://api.zotero.org/users/1/settings/tagColors', async (req, res) => {
				const tagColors = await req.json();
				expect(tagColors.value).toHaveLength(3);
				expect(tagColors.value).not.toContainEqual({
					'name': 'to read',
					'color': '#FF6666'
				});
				hasBeenPosted = true;
				return res(res => {
					res.status = 204;
					return res;
				});
			})
		);

		await user.click(screen.getByRole('button', { name: 'Tag Selector Options' }));
		const manageTagsOpt = await screen.findByRole('menuitem', { name: 'Manage Tags' });
		await user.click(manageTagsOpt);
		const manageTagsModal = await screen.findByRole('dialog', { name: 'Manage Tags' });
		const list = await findByRole(manageTagsModal, 'list', { name: 'Tags' });
		const tagItem = await findByRole(list, 'listitem', { name: 'to read' });
		const moreButton = getByRole(tagItem, 'button', { name: 'More' });
		await user.click(moreButton);
		await user.click(await screen.findByRole('menuitem', { name: 'Remove Color' }));
		expect(hasBeenPosted).toBe(true);
	});
});

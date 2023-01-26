import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getByRole, screen, queryByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import fileSaver from 'file-saver';

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import itemFields from './fixtures/response/item-fields';
import itemTypeFieldsBook from './fixtures/response/item-type-fields-book.json';
import itemTypeCreatorTypesBook from './fixtures/response/item-type-creator-types-book.json';

// Force My Library to be read-only
stateRaw.config.libraries[0].isReadOnly = true;

const state = JSONtoState(stateRaw);
applyAdditionalJestTweaks();
jest.mock('file-saver');

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
	});

	beforeEach(() => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/collection');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Not run redundant image cleanup in read-only library', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const noteItem = screen.getByRole('row', { name: 'Puppies!' });
		await userEvent.click(noteItem);
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
		await userEvent.click(nextItem);
		await waitForPosition();
	});

	test('Expand and collapse nodes in collections tree', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const tree = screen.getByRole('navigation', { name: 'collection tree' });
		const myLibraryTreeItem = getByRole(tree, 'treeitem', { name: 'My Library' });
		const dogsTreeItem = getByRole(tree, 'treeitem', { name: 'Dogs' });
		const expandButton = getByRole(dogsTreeItem, 'button', { name: 'Expand' });

		expect(myLibraryTreeItem).toHaveAttribute('aria-level', '1');
		expect(dogsTreeItem).toHaveAttribute('aria-level', '2');
		expect(queryByRole(tree, 'treeitem', { name: 'Goldens' })).not.toBeInTheDocument();

		await userEvent.click(expandButton);
		await waitForPosition();

		expect(getByRole(tree, 'treeitem', { name: 'Dogs', expanded: true })).toBeInTheDocument();
		const goldensTreeItem = getByRole(tree, 'treeitem', { name: 'Goldens' });
		expect(goldensTreeItem).toBeInTheDocument();
		expect(goldensTreeItem).toHaveAttribute('aria-level', '3');

		const collapseButton = getByRole(dogsTreeItem, 'button', { name: 'Collapse' });
		await userEvent.click(collapseButton);
		await waitForPosition();

		expect(getByRole(tree, 'treeitem', { name: 'Dogs', expanded: false })).toBeInTheDocument();
		expect(queryByRole(tree, 'treeitem', { name: 'Goldens' })).not.toBeInTheDocument();
	});

	test('Export item using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const exportBtn = screen.getByRole('button', { name: 'Export' });
		await userEvent.click(exportBtn);
		await waitForPosition();

		// menu should be open
		expect(screen.getByRole('button',
			{ name: 'Export', expanded: true })
		).toBeInTheDocument();

		let hasBeenPosted = false;

		server.use(
			rest.get('https://api.zotero.org/users/1/items', async (req, res) => {
				expect(req.url.searchParams.get('format')).toEqual('bibtex');
				expect(req.url.searchParams.get('includeTrashed')).toEqual('true');
				expect(req.url.searchParams.get('itemKey')).toEqual('VR82JUX8');

				hasBeenPosted = true;
				return res(res => {
					res.body = '';
					return res;
				});
			}),
		);

		const bibtexOpt = screen.getByRole('menuitem', { name: 'BibTeX' });
		await userEvent.click(bibtexOpt);
		await waitForPosition();

		expect(hasBeenPosted).toBe(true);
		expect(fileSaver.saveAs).toHaveBeenCalledTimes(1);
	});

});

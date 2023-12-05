import '@testing-library/jest-dom';
import fileSaver from 'file-saver';
import { PDFWorker } from '../src/js/common/pdf-worker.js';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getByRole, screen, queryByRole, waitFor, findByRole, findAllByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import creatorFields from './fixtures/response/creator-fields';
import itemTypeFieldsBook from './fixtures/response/item-type-fields-book.json';
import itemTypeCreatorTypesBook from './fixtures/response/item-type-creator-types-book.json';
import testUserChildren from './fixtures/response/test-user-children.json';

jest.mock('file-saver');
jest.mock('../src/js/common/pdf-worker.js');

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

	test('Select multiple items with cmd+click', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const user = userEvent.setup();

		const currentItem = screen.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' });
		const firstItem = screen.getByRole('row', { name: 'Puppies!' });
		const secondItem = screen.getByRole('row', { name: 'Understanding dogs' });

		expect(currentItem).toHaveAttribute('aria-selected', 'true');
		expect(firstItem).toHaveAttribute('aria-selected', 'false');
		expect(secondItem).toHaveAttribute('aria-selected', 'false');

		await user.keyboard('[OSLeft>][ControlRight>]');
		await user.click(firstItem);
		await waitForPosition();

		expect(currentItem).toHaveAttribute('aria-selected', 'true');
		expect(firstItem).toHaveAttribute('aria-selected', 'true');
		expect(secondItem).toHaveAttribute('aria-selected', 'false');

		await user.click(secondItem);
		await user.keyboard('[/OSLeft>][/ControlRight]');
		await waitForPosition();

		expect(currentItem).toHaveAttribute('aria-selected', 'true');
		expect(firstItem).toHaveAttribute('aria-selected', 'true');
		expect(secondItem).toHaveAttribute('aria-selected', 'true');

		await user.click(screen.getByRole('treeitem', { name: 'Dogs' }));

		expect(currentItem).toHaveAttribute('aria-selected', 'false');
		expect(firstItem).toHaveAttribute('aria-selected', 'false');
		expect(secondItem).toHaveAttribute('aria-selected', 'false');
	});

	test('Open reader in a new tab with a double click', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		global.open = jest.fn();

		await userEvent.dblClick(screen.getByRole('row', { name: 'Effects of diet restriction on life span and age-related changes in dogs' }));
		await waitFor(() => expect(global.open).toBeCalledWith('/testuser/collections/WTTJ2J56/items/VR82JUX8/attachment/VG79HDDM/reader'));
	});

	test('Open and download an attachment in the attachment pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		server.use(
			http.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json(testUserChildren, {
					headers: { 'Total-Results': 2 }
				});
			}),
			http.get('https://api.zotero.org/users/1/items/VG79HDDM/file/view/url', () => {
				return HttpResponse.text('https://files.zotero.net/qwertyuiopasdfghjklzxcvbnm/Kealy%20et%20al.%20-%202002%20-%20Effects%20of%20diet%20restriction%20on%20life%20span%20and%20age-r.pdf');
			})
		);

		await userEvent.click(screen.getByRole('tab', { name: 'Attachments', selected: false }));
		await waitForPosition();

		const attachmentsList = await screen.findByRole('list', { name: 'Attachments' });
		expect(await findAllByRole(attachmentsList, 'listitem')).toHaveLength(2);
		expect(screen.getByText('No attachment selected')).toBeInTheDocument();

		// read only, make sure "add" buttons are not there
		expect(screen.queryByRole('button', { name: 'Add File' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Add Linked URL' })).not.toBeInTheDocument();

		await userEvent.click(getByRole(attachmentsList, 'listitem', { name: 'Full Text' }));
		await findByRole(attachmentsList, 'listitem', { name: 'Full Text', current: true });

		expect(await screen.findByRole('link', { name: 'Original URL' })).toBeInTheDocument();

		global.open = jest.fn();

		expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('href', '/testuser/collections/WTTJ2J56/items/VR82JUX8/attachment/VG79HDDM/reader');

		server.use(
			http.get('https://api.zotero.org/users/1/items/VG79HDDM/children', () => {
				return HttpResponse.json([]);
			}),
			http.get('https://files.zotero.net/qwertyuiopasdfghjklzxcvbnm/Kealy%20et%20al.%20-%202002%20-%20Effects%20of%20diet%20restriction%20on%20life%20span%20and%20age-r.pdf', () => {
				return HttpResponse.text('');
			})
		);

		await userEvent.click(screen.getByRole('button', { name: 'Download' }));

		await waitFor(() => expect(PDFWorker.mock.instances[0].export).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(fileSaver.saveAs).toHaveBeenCalledTimes(1));

		await userEvent.click(screen.getByRole('button', { name: 'More Download Options' }));
		expect(screen.getByRole('listitem', { name: 'Download (no annotations)' }))
			.toHaveAttribute('href', 'https://files.zotero.net/qwertyuiopasdfghjklzxcvbnm/Kealy%20et%20al.%20-%202002%20-%20Effects%20of%20diet%20restriction%20on%20life%20span%20and%20age-r.pdf')
	});
});

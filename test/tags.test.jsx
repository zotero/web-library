/*
* @jest-environment ./test/utils/zotero-env.js
*/

import React from 'react';
import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { findAllByRole, findByRole, getByRole, screen, queryAllByRole, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import testUserTagsSuggestions from './fixtures/response/test-user-tags-suggestions.json';
import testUserTagsForItem from './fixtures/response/test-user-tags-for-item.json';
import testUserManageTags from './fixtures/response/test-user-manage-tags.json';

const state = JSONtoState(stateRaw);

describe('Tags', () => {
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

		// item has one tag (read-only textbox) + input field for another
		await waitFor(() => expect(screen.getAllByRole('textbox',
			{ name: 'Tag Name' })
		).toHaveLength(2));

		const tagInput = screen.getAllByRole('textbox',
			{ name: 'Tag Name' }
		).find(el => !el.getAttribute('aria-readonly'));

		expect(tagInput).toBeInTheDocument();
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


	test('Filter tags in tag manager', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		server.use(
			rest.get('https://api.zotero.org/users/1/tags', (req, res) => {
				return res(res => {
					res.headers.set('Total-Results', 8);
					res.body = JSON.stringify(testUserManageTags);
					return res;
				});
			}),
		);

		await user.click(screen.getByRole('button', { name: 'Tag Selector Options' }));
		const manageTagsOpt = await screen.findByRole('menuitem', { name: 'Manage Tags' });
		await user.click(manageTagsOpt);
		const manageTagsModal = await screen.findByRole('dialog', { name: 'Manage Tags' });
		const list = await findByRole(manageTagsModal, 'list', { name: 'Tags' });
		expect(await findAllByRole(list, 'listitem')).toHaveLength(8);

		await user.type(screen.getByRole('searchbox', { name: 'Filter Tags' }), 'read');
		expect(await findAllByRole(list, 'listitem')).toHaveLength(1); // eslint-disable-line jest-dom/prefer-in-document
	});
});

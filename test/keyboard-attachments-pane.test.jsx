/*
* @jest-environment ./test/utils/zotero-css-env.js
*/
import '@testing-library/jest-dom';
import { act, getByRole, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-attachment-view.json';

const state = JSONtoState(stateRaw);

describe('', () => {
	// these tests include styles which makes them very slow
	applyAdditionalJestTweaks({ timeout: 240000 });
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

	test('Navigate through attachments pane using keyboard', async () => {
		delete window.location;
		window.location = new URL('http://localhost/testuser/items/3JCLFUG4/attachment/37V7V4NT/library');

		server.use(
			rest.get('https://api.zotero.org/users/1/items/37V7V4NT/file/view/url', (req, res) => {
				return res(res => {
					res.body = 'https://files.zotero.net/abcdefgh/18726.html';
					return res;
				});
			}),
			rest.get('https://api.zotero.org/users/1/items/K24TUDDL/file/view/url', (req, res) => {
				return res(res => {
					res.body = 'https://files.zotero.net/abcdefgh/Silver%20-%202005%20-%20Cooperative%20pathfinding.pdf';
					return res;
				});
			})
		);

		const user = userEvent.setup()
		renderWithProviders(<MainZotero />, { preloadedState: state, includeStyles: true });
		await waitForPosition();
		act(() => screen.getByRole('tab', { name: 'Attachments' }).focus());

		await user.keyboard('{tab}');
		expect(screen.getByLabelText('Add File')).toHaveFocus();

		await user.keyboard('{arrowright}');
		expect(screen.getByRole('button', { name: 'Add Linked URL' })).toHaveFocus();

		await user.keyboard('{shift>}{tab}{/shift}');
		expect(screen.getByRole('tab', { name: 'Attachments' })).toHaveFocus();

		await user.keyboard('{tab}{tab}');
		expect(screen.getByRole('listitem', { name: 'Snapshot' })).toHaveFocus();

		await user.keyboard('{arrowup}');
		expect(screen.getByRole('listitem', { name: 'Full Text' })).toHaveFocus();

		await user.keyboard('{arrowup}');
		expect(screen.getByLabelText('Add File')).toHaveFocus();

		await user.keyboard('{arrowdown}');
		const listItem = screen.getByRole('listitem', { name: 'Full Text' });
		expect(listItem).toHaveFocus();

		await user.keyboard('{arrowright}');
		expect(getByRole(listItem, 'button', { name: 'Open In Reader' })).toHaveFocus();

		await user.keyboard('{arrowright}');
		expect(getByRole(listItem, 'button', { name: 'Export Attachment With Annotations' })).toHaveFocus();

		await user.keyboard('{arrowright}');
		expect(getByRole(listItem, 'button', { name: 'Delete Attachment' })).toHaveFocus();
	});
});

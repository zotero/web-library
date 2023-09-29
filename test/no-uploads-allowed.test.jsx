import '@testing-library/jest-dom';
import { rest, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';

jest.mock('file-saver');

// Force My Library not to allow file uploads
stateRaw.config.libraries[0].isFileUploadAllowed = false;
const state = JSONtoState(stateRaw);
applyAdditionalJestTweaks();

describe('No file uploads allowed', () => {
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

	test('Hide "Upload File" item in the "plus" button menu', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const plusBtn = screen.getByRole('button', { name: 'New Item' });
		await userEvent.click(plusBtn);
		await waitForPosition();

		// menu should be open
		expect(screen.getByRole('button',
			{ name: 'New Item', expanded: true })
		).toBeInTheDocument();

		expect(screen.queryByRole('menuitem', { name: 'Upload File' })).not.toBeInTheDocument();
	});

	test('Hide "Add File" button in the attachments pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		server.use(
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': 0 },
				});
			})
		);

		await userEvent.click(screen.getByRole('tab', { name: 'Attachments', selected: false }));

		expect(await screen.findByText('0 attachments')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Add File' })).not.toBeInTheDocument();
		// "Add Linked URL" button should still be there
		expect(screen.queryByRole('button', { name: 'Add Linked URL' })).toBeInTheDocument();
	});

});

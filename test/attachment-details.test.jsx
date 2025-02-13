/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { delay, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';
import { act, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-pdf-attachment-view-in-collection-view.json';

// need to mock structuredClone, otherwise web library hides export/open related to reader/pdf.js. See #548
global.structuredClone = jest.fn();

const state = JSONtoState(stateRaw);

describe('Attachment Details', () => {
	const handlers = [
		http.get('https://api.zotero.org/users/1/items/K24TUDDL/file/view/url', async () => {
			return HttpResponse.text('https://files.zotero.net/abcdefgh/Silver - 2005 - Cooperative pathfinding.pdf');
		}),
	];
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
		window.location = new URL('http://localhost/testuser/collections/CSB4KZUU/items/3JCLFUG4/attachment/K24TUDDL/item-details');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test('Patch attachment title', async () => {
		let hasBeenPatched = false;
		const user = userEvent.setup();
		server.use(
			http.patch('https://api.zotero.org/users/1/items/K24TUDDL', async ({ request }) => {
				const item = await request.json();
				expect(item.title).toBe('Updated');
				hasBeenPatched = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const attachmentsTabPanel = await screen.findByRole('tabpanel', { name: 'Attachments' });
		const titleField = getByRole(attachmentsTabPanel, 'textbox', { name: 'Title' });
		expect(titleField).toHaveTextContent('Full Text');

		let expectedDate = new Date().toLocaleString(window.navigator.language);

		await user.click(titleField);
		await waitFor(() => expect(getByRole(attachmentsTabPanel, 'textbox', { name: 'Title' })).toHaveFocus());
		await user.type(
			getByRole(attachmentsTabPanel, 'textbox', { name: 'Title' }),
			'Updated{enter}', { skipClick: true }
		);

		await waitFor(() => expect(
			getByRole(attachmentsTabPanel, 'textbox', { name: 'Title' })
		).toHaveTextContent('Updated'));
		await waitFor(() => expect(
			getByRole(attachmentsTabPanel, 'textbox', { name: 'Date Modified' })
		).toHaveTextContent(new RegExp(`^${expectedDate.split(',')[0]}`)));
		expect(hasBeenPatched).toBe(true);
	});

	test('Update attachment filename', async () => {
		let hasBeenPosted = false;
		const user = userEvent.setup();
		server.use(
			http.post('https://api.zotero.org/users/1/items/K24TUDDL/file', async ({ request }) => {
				const bodyParams = (await request.text()).split('&');
				expect(bodyParams).toContain('filename=Updated.pdf');
				expect(bodyParams).toContain('md5=b712b14979bddbbd264f6c66b2f820b1');
				hasBeenPosted = true;
				return HttpResponse.json({'exists': 1 });
			})
		);

		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const attachmentsTabPanel = await screen.findByRole('tabpanel', { name: 'Attachments' });
		const filenameField = getByRole(attachmentsTabPanel, 'textbox', { name: 'Filename' });
		expect(filenameField).toHaveTextContent('Silver - 2005 - Cooperative pathfinding.pdf');

		await user.click(filenameField);
		await waitFor(() => expect(getByRole(attachmentsTabPanel, 'textbox', { name: 'Filename' })).toHaveFocus());
		await user.type(
			getByRole(attachmentsTabPanel, 'textbox', { name: 'Filename' }),
			'Updated.pdf{enter}', { skipClick: true }
		);

		await waitFor(() => expect(
			getByRole(attachmentsTabPanel, 'textbox', { name: 'Filename' })
		).toHaveTextContent('Updated.pdf'));
		expect(hasBeenPosted).toBe(true);
	});

	test('Upload new attachment file', async () => {
		let hasBeenUploaded = false;
		let hasBeenPatched = false;

		server.use(
			http.post('https://api.zotero.org/users/1/items/K24TUDDL/file', async ({ request }) => {
				const bodyParams = (await request.text()).split('&');
				expect(bodyParams).toContain('filename=hello.pdf');
				expect(bodyParams).toContain('md5=b59c67bf196a4758191e42f76670ceba');
				await delay(100); // ensure "ongoing" state is shown
				hasBeenUploaded = true;
				return HttpResponse.json({ 'exists': 1 });
			})
		);

		server.use(
			http.patch('https://api.zotero.org/users/1/items/K24TUDDL', async ({ request }) => {
				const item = await request.json();
				expect(item.filename).toBe('hello.pdf');
				hasBeenPatched = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const attachmentsTabPanel = await screen.findByRole('tabpanel', { name: 'Attachments' });

		expect(getByRole(attachmentsTabPanel, 'textbox', { name: 'Filename' }))
			.toHaveTextContent('Silver - 2005 - Cooperative pathfinding.pdf');


		const input = screen.getByLabelText('Upload New', { selector: 'input' });
		const file = new File([1, 1, 1, 1], 'hello.pdf', { type: 'application/pdf' })
		act(() => {
			userEvent.upload(input, file);
		});

		expect(await screen.findByText('Uploading')).toBeInTheDocument();
		await waitFor(() => expect(screen.queryByText('Uploading')).not.toBeInTheDocument());

		expect(getByRole(attachmentsTabPanel, 'textbox', { name: 'Filename' }))
			.toHaveTextContent('hello.pdf');

			expect(hasBeenUploaded).toBe(true);
		expect(hasBeenPatched).toBe(true);
	});
});

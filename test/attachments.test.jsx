/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { rest, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node';
import { findByRole, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-item-view.json';
import newItemFileAttachment from './fixtures/response/new-item-file-attachment.json';
import newItemLinkedAttachment from './fixtures/response/new-item-linked-attachment.json';
import testUserAddNewAttachmentFile from './fixtures/response/test-user-add-new-attachment-file.json';
import testUserAddAttachamentFileRefetchParent from './fixtures/response/test-user-add-attachment-file-refetch-parent.json';
import testUserAddNewLinkedURLAttachment from './fixtures/response/test-user-add-new-linked-url-attachment.json';

const state = JSONtoState(stateRaw);

describe('Attachments', () => {
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

	test('Add a file attachment using button in side pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false;
		let hasBeenUploaded = false;

		server.use(
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			rest.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('imported_file');
				return HttpResponse.json(newItemFileAttachment);
			}),
			rest.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('imported_file');
				expect(items[0].parentItem).toBe('VR82JUX8');
				expect(items[0].filename).toBe('hello.pdf');
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewAttachmentFile);
			}),
			rest.post('https://api.zotero.org/users/1/items/FFIILLEE/file', async ({request}) => {
				const body = await request.text();
				expect(body).toMatch(/filename=hello.pdf/);
				hasBeenUploaded = true;
				await delay(100); // ensure "ongoing" state is shown
				return HttpResponse.json({ exists: 1 });
			}),
			rest.get('https://api.zotero.org/users/1/items', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemKey')).toBe('VR82JUX8');
				return HttpResponse.json(testUserAddAttachamentFileRefetchParent, {
					headers: {
						'Total-Results': '1',
					},
				});
			})
		);

		await user.click(screen.getByRole('tab', { name: 'Attachments' }));
		await screen.findByRole('button', { name: 'Add File' });
		expect(await screen.findByText('0 attachments')).toBeInTheDocument();

		const input = screen.getByLabelText('Add File');
		const file = new File([1,1,1,1], 'hello.pdf', { type: 'application/pdf' })
		userEvent.upload(input, file);

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
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			rest.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('linked_url');
				return HttpResponse.json(newItemLinkedAttachment);
			}),
			rest.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('linked_url');
				expect(items[0].parentItem).toBe('VR82JUX8');
				expect(items[0].url).toBe('http://example.com/'); // auto-corrected into valid URL
				expect(items[0].title).toBe('Example');
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewLinkedURLAttachment);
			})
		);

		await user.click(screen.getByRole('tab', { name: 'Attachments' }));
		await screen.findByRole('button', { name: 'Add Linked URL' });
		expect(await screen.findByText('0 attachments')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Add Linked URL' }));

		const dialog = await screen.findByRole('dialog', { name: 'Add Linked URL' });
		const linkInput = getByRole(dialog, 'textbox', { name: 'Link' });
		const titleInput = getByRole(dialog, 'textbox', { name: 'Title' });

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

	test('Add a standalone attachment using "Upload File" option in the "plus" button menu', async () => {
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
		let hasBeenUploaded = false;

		server.use(
			rest.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			rest.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('imported_file');
				return HttpResponse.json(newItemFileAttachment);
			}),
			rest.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('imported_file');
				expect(items[0].parentItem).toBeFalsy();
				expect(items[0].filename).toBe('hello.pdf');
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewAttachmentFile);
			}),
			rest.post('https://api.zotero.org/users/1/items/FFIILLEE/file', async ({request}) => {
				const body = await request.text();
				expect(body).toMatch(/filename=hello.pdf/);
				hasBeenUploaded = true;
				await delay(100); // ensure "ongoing" state is shown
				return HttpResponse.json({ exists: 1 });
			}),
			rest.get('https://api.zotero.org/users/1/items', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemKey')).toBe('VR82JUX8');
				return HttpResponse.json(testUserAddAttachamentFileRefetchParent, {
					headers: { 'Total-Results': '1' },
				});
			})
		);

		await waitFor(() => expect(screen.queryByText('Uploading 1 file')).not.toBeInTheDocument());

		const input = screen.getByLabelText('Upload File', { selector: 'input' });
		const file = new File([1, 1, 1, 1], 'hello.pdf', { type: 'application/pdf' })
		userEvent.upload(input, file);

		expect(await screen.findByText('Uploading 1 file')).toBeInTheDocument();
		expect(await screen.findByRole('row', { name: 'hello.pdf' })).toBeInTheDocument();
		await waitFor(() => expect(screen.queryByText('Uploading 1 file')).not.toBeInTheDocument());

		expect(hasBeenPosted).toBe(true);
		expect(hasBeenUploaded).toBe(true);
	});
});

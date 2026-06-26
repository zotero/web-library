/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse, delay } from 'msw'
import { setupServer } from 'msw/node';
import { findByRole, getByRole, screen, waitFor, queryByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import { setupMSWLifecycle } from './utils/msw-lifecycle';
import stateRaw from './fixtures/state/desktop-test-user-item-view.json';
import newItemFileAttachment from './fixtures/response/new-item-file-attachment.json';
import newItemLinkedAttachment from './fixtures/response/new-item-linked-attachment.json';
import testUserAddNewAttachmentFile from './fixtures/response/test-user-add-new-attachment-file.json';
import testUserAddAttachamentFileRefetchParent from './fixtures/response/test-user-add-attachment-file-refetch-parent.json';
import testUserAddNewLinkedURLAttachment from './fixtures/response/test-user-add-new-linked-url-attachment.json';
import topLevelAttachmentStateRaw from './fixtures/state/desktop-test-user-top-level-attachment-view.json';
import itemsInCollectionAlgorithms from './fixtures/response/test-user-get-items-in-collection-algorithms.json';
import responseUpdateAttachment from './fixtures/response/test-user-update-top-level-attachment-set-parent.json';
import newItemNote from './fixtures/response/new-item-note.json';
import testUserAddNewItemNote from './fixtures/response/test-user-add-new-item-note.json';

// need to mock structuredClone, otherwise web library hides export/open related to reader/pdf.js. See #548
global.structuredClone = jest.fn();

const state = JSONtoState(stateRaw);
const topLevelAttachmentState = JSONtoState(topLevelAttachmentStateRaw);

describe('Attachments', () => {
	const handlers = [];
	const server = setupServer(...handlers)
	applyAdditionalJestTweaks();
	setupMSWLifecycle(server);

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/WTTJ2J56/items/VR82JUX8/item-details' });
	});

	test('Add a file attachment using button in side pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false;
		let hasBeenUploaded = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('imported_file');
				return HttpResponse.json(newItemFileAttachment);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('imported_file');
				expect(items[0].parentItem).toBe('VR82JUX8');
				expect(items[0].filename).toBe('hello.pdf');
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewAttachmentFile);
			}),
			http.post('https://api.zotero.org/users/1/items/FFIILLEE/file', async ({request}) => {
				const body = await request.text();
				expect(body).toMatch(/filename=hello.pdf/);
				hasBeenUploaded = true;
				await delay(100); // ensure "ongoing" state is shown
				return HttpResponse.json({ exists: 1 });
			}),
			http.get('https://api.zotero.org/users/1/items', ({request}) => {
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
		expect(getByRole(listitem, 'button', { name: 'Attachment Options' })).toBeInTheDocument();
		expect(hasBeenPosted).toBe(true);
		expect(hasBeenUploaded).toBe(true);
	});

	test('Add a linked URL attachment using button in side pane', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();
		const user = userEvent.setup();
		let hasBeenPosted = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('linked_url');
				return HttpResponse.json(newItemLinkedAttachment);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
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
		expect(getByRole(listitem, 'button', { name: 'Attachment Options' })).toBeInTheDocument();
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
			http.get('https://api.zotero.org/users/1/items/VR82JUX8/children', () => {
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
			http.get('https://api.zotero.org/items/new', ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('attachment');
				expect(url.searchParams.get('linkMode')).toBe('imported_file');
				return HttpResponse.json(newItemFileAttachment);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({request}) => {
				const items = await request.json();
				expect(items[0].itemType).toBe('attachment');
				expect(items[0].linkMode).toBe('imported_file');
				expect(items[0].parentItem).toBeFalsy();
				expect(items[0].filename).toBe('hello.pdf');
				hasBeenPosted = true;
				return HttpResponse.json(testUserAddNewAttachmentFile);
			}),
			http.post('https://api.zotero.org/users/1/items/FFIILLEE/file', async ({request}) => {
				const body = await request.text();
				expect(body).toMatch(/filename=hello.pdf/);
				hasBeenUploaded = true;
				await delay(100); // ensure "ongoing" state is shown
				return HttpResponse.json({ exists: 1 });
			}),
			http.get('https://api.zotero.org/users/1/items', ({request}) => {
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
	test('Change parent item', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4' });

		server.use(
			http.get('https://api.zotero.org/users/1/items/UMPPCXU4/file/view/url', () => {
				return HttpResponse.text('https://files.zotero.net/attention-is-all-you-need.pdf');
			}),
			http.get('https://api.zotero.org/users/1/collections/CSB4KZUU/items/top', () => {
				return HttpResponse.json(itemsInCollectionAlgorithms, {
					headers: { 'Total-Results': '23' }
				});
			}),
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				expect(items[0].parentItem).toBe('UICI7HS9');
				return HttpResponse.json(responseUpdateAttachment);
			}),
			http.get('https://api.zotero.org/users/1/items/UICI7HS9/children', () => {
				// This would return the updated item but it's irrelevant for this test
				return HttpResponse.json([], {
					headers: { 'Total-Results': '0' }
				});
			}),
		);

		renderWithProviders(<MainZotero />, { preloadedState: topLevelAttachmentState });
		await waitForPosition();
		const user = userEvent.setup();

		expect(queryByRole(await screen.findByRole('row', { name: 'Marching in Squares' }), 'gridcell', { name: 'Has PDF Attachment' })).not.toBeInTheDocument();

		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });
		await user.click(getByRole(toolbar, 'button', { name: 'More' }));
		await waitForPosition();
		await user.click(screen.getByRole('menuitem', { name: 'Change Parent Item' }));
		const dialog = await screen.findByRole('dialog', { name: 'Change Parent Item' });
		const items = getByRole(dialog, 'grid', { name: 'items' });
		const row = getByRole(items, 'row', { name: 'Marching in Squares' });
		await user.click(row);
		await waitFor(() => expect(getByRole(dialog, 'button', { name: 'Select' })).toBeEnabled());
		await user.click(getByRole(dialog, 'button', { name: 'Select' }));
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Change Parent Item' })).not.toBeInTheDocument());

		expect(getByRole(await screen.findByRole('row', { name: 'Marching in Squares' }), 'gridcell', { name: 'Has PDF Attachment' })).toBeInTheDocument();
	});

	test('Migrate an attachment note to a standalone note', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4' });

		const createdNoteKey = testUserAddNewItemNote.successful['0'].key; // 'BBCCDDEE'
		// The migrated note is standalone here, so strip parentItem/up-link from the canned response
		const noteCreateResponse = JSON.parse(JSON.stringify(testUserAddNewItemNote));
		delete noteCreateResponse.successful['0'].data.parentItem;
		delete noteCreateResponse.successful['0'].links.up;

		let notePosted = false;
		let attachmentPatched = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items/UMPPCXU4/file/view/url', () => {
				return HttpResponse.text('https://files.zotero.net/attention-is-all-you-need.pdf');
			}),
			http.get('https://api.zotero.org/users/1/collections/CSB4KZUU/items/top', () => {
				return HttpResponse.json(itemsInCollectionAlgorithms, {
					headers: { 'Total-Results': '23' }
				});
			}),
			http.get('https://api.zotero.org/items/new', ({ request }) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('itemType')).toBe('note');
				return HttpResponse.json(newItemNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async ({ request }) => {
				const items = await request.json();
				expect(items).toHaveLength(1);
				expect(items[0].itemType).toBe('note');
				// note body is copied verbatim from the attachment
				expect(items[0].note).toBe('<div data-schema-version="9"><p>This is an attachment note</p>\n</div>');
				// standalone attachment -> standalone note in the same collection(s), no parent
				expect(items[0].collections).toEqual(['CSB4KZUU']);
				expect(items[0].parentItem).toBeUndefined();
				// new note is related back to the original attachment
				expect(items[0].relations['dc:relation']).toBe('http://zotero.org/users/1/items/UMPPCXU4');
				notePosted = true;
				return HttpResponse.json(noteCreateResponse);
			}),
			http.patch('https://api.zotero.org/users/1/items/UMPPCXU4', async ({ request }) => {
				const patch = await request.json();
				// the deprecated attachment note is cleared and related to the new note
				expect(patch.note).toBe('');
				expect(patch.relations['dc:relation']).toBe(`http://zotero.org/users/1/items/${createdNoteKey}`);
				attachmentPatched = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		renderWithProviders(<MainZotero />, { preloadedState: topLevelAttachmentState });
		await waitForPosition();
		const user = userEvent.setup();

		const migrateBtn = await screen.findByRole('button', { name: 'Migrate to Standalone Note' });
		await user.click(migrateBtn);

		await waitFor(() => expect(notePosted).toBe(true));
		await waitFor(() => expect(attachmentPatched).toBe(true));

		// once migrated, the now-empty attachment note editor and its migrate button disappear
		await waitFor(() => expect(
			screen.queryByRole('button', { name: 'Migrate to Standalone Note' })
		).not.toBeInTheDocument());
	});

	test('Disables the migrate button and prevents duplicate notes while a migration is in flight', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4' });

		const noteCreateResponse = JSON.parse(JSON.stringify(testUserAddNewItemNote));
		delete noteCreateResponse.successful['0'].data.parentItem;
		delete noteCreateResponse.successful['0'].links.up;

		let notePostCount = 0;
		let attachmentPatchCount = 0;
		let releaseNotePost;
		const notePostGate = new Promise(resolve => { releaseNotePost = resolve; });

		server.use(
			http.get('https://api.zotero.org/users/1/items/UMPPCXU4/file/view/url', () => {
				return HttpResponse.text('https://files.zotero.net/attention-is-all-you-need.pdf');
			}),
			http.get('https://api.zotero.org/users/1/collections/CSB4KZUU/items/top', () => {
				return HttpResponse.json(itemsInCollectionAlgorithms, {
					headers: { 'Total-Results': '23' }
				});
			}),
			http.get('https://api.zotero.org/items/new', () => {
				return HttpResponse.json(newItemNote);
			}),
			http.post('https://api.zotero.org/users/1/items', async () => {
				notePostCount++;
				// keep the migration in flight until the test releases it
				await notePostGate;
				return HttpResponse.json(noteCreateResponse);
			}),
			http.patch('https://api.zotero.org/users/1/items/UMPPCXU4', () => {
				attachmentPatchCount++;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		renderWithProviders(<MainZotero />, { preloadedState: topLevelAttachmentState });
		await waitForPosition();
		// disable the pointer-events guard so the second (no-op) click on the disabled button is attempted
		const user = userEvent.setup({ pointerEventsCheck: 0 });

		const migrateBtn = await screen.findByRole('button', { name: 'Migrate to Standalone Note' });
		await user.click(migrateBtn);

		// while the migration is in flight the button is disabled, guarding against re-entry
		await waitFor(() => expect(migrateBtn).toBeDisabled());

		// the multi-request migration is registered as an ongoing process (spinner + before-unload guard)
		expect(await screen.findByText('Migrating attachment note')).toBeInTheDocument();

		// a second click while in flight must not start another migration
		await user.click(migrateBtn);

		// let the in-flight note creation (and the follow-up attachment patch) complete
		releaseNotePost();

		await waitFor(() => expect(
			screen.queryByRole('button', { name: 'Migrate to Standalone Note' })
		).not.toBeInTheDocument());

		// the ongoing process is auto-dismissed once the migration settles
		await waitFor(() => expect(screen.queryByText('Migrating attachment note')).not.toBeInTheDocument());

		// exactly one note was created and the attachment was patched once -- no duplicates
		expect(notePostCount).toBe(1);
		expect(attachmentPatchCount).toBe(1);
	});

	test('Surfaces an error and keeps the attachment note when migration fails', async () => {
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/collections/CSB4KZUU/items/UMPPCXU4' });

		let noteCreateAttempted = false;
		let patchAttempted = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items/UMPPCXU4/file/view/url', () => {
				return HttpResponse.text('https://files.zotero.net/attention-is-all-you-need.pdf');
			}),
			http.get('https://api.zotero.org/users/1/collections/CSB4KZUU/items/top', () => {
				return HttpResponse.json(itemsInCollectionAlgorithms, {
					headers: { 'Total-Results': '23' }
				});
			}),
			http.get('https://api.zotero.org/items/new', () => {
				return HttpResponse.json(newItemNote);
			}),
			// creating the note fails (400 is non-transient, so the api client throws immediately
			// instead of retrying a 5xx with backoff)
			http.post('https://api.zotero.org/users/1/items', () => {
				noteCreateAttempted = true;
				return new HttpResponse(null, { status: 400 });
			}),
			http.patch('https://api.zotero.org/users/1/items/UMPPCXU4', () => {
				patchAttempted = true;
				return new HttpResponse(null, { status: 204 });
			}),
		);

		renderWithProviders(<MainZotero />, { preloadedState: topLevelAttachmentState });
		await waitForPosition();
		const user = userEvent.setup();

		const migrateBtn = await screen.findByRole('button', { name: 'Migrate to Standalone Note' });
		await user.click(migrateBtn);

		await waitFor(() => expect(noteCreateAttempted).toBe(true));

		// the failure is surfaced to the user ...
		await waitFor(() => expect(document.querySelector('.message.error')).toBeInTheDocument());

		// ... the original attachment is never patched, so there is no data loss ...
		expect(patchAttempted).toBe(false);

		// ... and the editor + migrate button remain, with the button re-enabled so the user can retry
		const retryBtn = await screen.findByRole('button', { name: 'Migrate to Standalone Note' });
		await waitFor(() => expect(retryBtn).not.toBeDisabled());

		// ... and the ongoing process is cleared even on failure, so no spinner or unload guard lingers
		await waitFor(() => expect(screen.queryByText('Migrating attachment note')).not.toBeInTheDocument());
	});
});

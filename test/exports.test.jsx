/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { findByText, getByRole, screen, getByText, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import fileSaver from 'file-saver';

import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/test-user-search-selected.json';
import testUserCitations from './fixtures/response/test-user-citations.json';
import testUserBibliographyMLA from './fixtures/response/test-user-bibliography-mla-xml.js';
import testUserBibliographyTurabian from './fixtures/response/test-user-bibliography-turabian-xml.js';

// Force My Library to be read-only
stateRaw.config.libraries[0].isReadOnly = true;

const state = JSONtoState(stateRaw);
applyAdditionalJestTweaks();
jest.mock('file-saver');

describe('Test User: Export, bibliography, citations, subscribe to feed', () => {
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
		window.location = new URL('http://localhost/testuser/tags/to%20read/search/pathfinding/titleCreatorYear/items/J489T6X3,3JCLFUG4/item-list');
	});

	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

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
				expect(req.url.searchParams.get('itemKey')).toEqual('J489T6X3,3JCLFUG4');

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

	test('Generate citations for selected items using toolbar', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		let hasBeenPosted = false;
		server.use(
			rest.get('https://api.zotero.org/users/1/items', async (req, res) => {
				expect(req.url.searchParams.get('include')).toEqual('citation');
				expect(req.url.searchParams.get('includeTrashed')).toEqual('true');
				expect(req.url.searchParams.get('itemKey')).toEqual('J489T6X3,3JCLFUG4');
				expect(req.url.searchParams.get('style')).toEqual('modern-language-association');
				expect(req.url.searchParams.get('locale')).toEqual('en-US');

				hasBeenPosted = true;
				return res(res => {
					res.body = JSON.stringify(testUserCitations);
					return res;
				});
			}),
		);

		const createCitationsBtn = screen.getByRole('button', { name: 'Create Citations' });
		await userEvent.click(createCitationsBtn);
		await waitForPosition();

		const dialog = await screen.findByRole('dialog', { name: 'Citations' });

		expect(hasBeenPosted).toBe(true);
		expect(getByText(dialog, '(Silver)')).toBeInTheDocument();
		expect(getByText(dialog, '(Foead et al.)')).toBeInTheDocument();
	});

	test('Generate bibliography for selected items using toolbar', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		let requestsCounter = 0;
		server.use(
			rest.get('https://api.zotero.org/users/1/items', async (req, res) => {
				expect(req.url.searchParams.get('format')).toEqual('bib');
				expect(req.url.searchParams.get('includeTrashed')).toEqual('true');
				expect(req.url.searchParams.get('itemKey')).toEqual('J489T6X3,3JCLFUG4');

				const style = req.url.searchParams.get('style');
				const locale = req.url.searchParams.get('locale');
				requestsCounter++;

				expect(style).toBe(requestsCounter === 1 ? 'modern-language-association' : 'turabian-fullnote-bibliography');
				expect(locale).toBe(requestsCounter <= 2 ? 'en-US' : 'pl-PL');

				return res(res => {
					res.body = style === 'modern-language-association' ? testUserBibliographyMLA : testUserBibliographyTurabian;
					return res;
				});
			}),
		);

		const createBibliographyBtn = screen.getByRole('button', { name: 'Create Bibliography' });
		await userEvent.click(createBibliographyBtn);
		await waitForPosition();

		const dialog = await screen.findByRole('dialog', { name: 'Bibliography' });

		expect(requestsCounter).toBe(1);
		expect(getByText(dialog, /Foead, Daniel, et al\./)).toBeInTheDocument();
		expect(getByText(dialog, /Silver, David/)).toBeInTheDocument();

		const styleComboBox = screen.getByRole('combobox', { name: 'Citation Style' });
		await userEvent.click(styleComboBox);
		const option = getByRole(getByRole(styleComboBox, 'listbox'), 'option', { name: /Turabian/ });
		await userEvent.click(option);

		await findByText(dialog, /Foead, Daniel, Alifio Ghifari, Marchel Budi Kusuma, Novita Hanafiah, and Eric Gunawan/);
		expect(requestsCounter).toBe(2);

		const langComboBox = screen.getByRole('combobox', { name: 'Language' });
		await userEvent.click(langComboBox);
		await userEvent.selectOptions(getByRole(langComboBox, 'listbox'), 'Polish');

		await findByText(dialog, /Foead, Daniel, Alifio Ghifari, Marchel Budi Kusuma, Novita Hanafiah, and Eric Gunawan/);
		expect(requestsCounter).toBe(3);
	});

	test('Subscribe to feed using toolbar button', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const toolbar = screen.getByRole('toolbar', { name: 'items toolbar' });

		const moreBtn = getByRole(toolbar, 'button', { name: 'More' });
		await userEvent.click(moreBtn);
		await waitForPosition();

		// menu should be open
		expect(getByRole(toolbar, 'button',
			{ name: 'More', expanded: true })
		).toBeInTheDocument();

		global.open = jest.fn();

		const subscribeToFeedBtn = screen.getByRole('menuitem', { name: 'Subscribe To Feed' });
		await userEvent.click(subscribeToFeedBtn);

		await waitFor(() => expect(global.open).toBeCalledWith('https://www.zotero.org/settings/keys/new?name=Private%20Feed&library_access=1&notes_access=1&redirect=https%3A%2F%2Fapi.zotero.org%2Fusers%2F1%2Fitems%2Ftop%3Fdirection%3Dasc%26format%3Datom%26q%3Dpathfinding%26qmode%3DtitleCreatorYear%26sort%3Dtitle%26tag%3Dto%2520read'));
	});

});

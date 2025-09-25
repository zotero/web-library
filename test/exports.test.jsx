/*
* @jest-environment ./test/utils/zotero-env.js
*/

import '@testing-library/jest-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { findByText, getByRole, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import fileSaver from 'file-saver';

import { installMockedXHR, uninstallMockedXHR, installUnhandledRequestHandler } from './utils/xhr-mock';
import { renderWithProviders } from './utils/render';
import { JSONtoState } from './utils/state';
import { MainZotero } from '../src/js/component/main';
import { applyAdditionalJestTweaks, waitForPosition } from './utils/common';
import stateRaw from './fixtures/state/desktop-test-user-search-selected.json';
import modernLanguageAssociationStyle from './fixtures/modern-language-association.csl.js';
import turabianNotesStyle from './fixtures/turabian-notes-bibliography.csl.js';
import chicagoStyle from './fixtures/chicago-notes-bibliography-subsequent-author-title-17th-edition.csl.js';

// Mock CSL
import CSL from 'citeproc';
window.CSL = CSL;

// Force My Library to be read-only
stateRaw.config.libraries[0].isReadOnly = true;

const state = JSONtoState(stateRaw);
applyAdditionalJestTweaks();
jest.mock('file-saver');

describe('Test User: Export, bibliography, citations, subscribe to feed', () => {
	const handlers = [];
	const server = setupServer(...handlers)

	beforeAll(() => {
		installUnhandledRequestHandler(server);
		installMockedXHR();
	});

	beforeEach(() => {
		delete window.location;
		window.jsdom.reconfigure({ url: 'http://localhost/testuser/tags/to%20read/search/pathfinding/titleCreatorYear/items/J489T6X3,3JCLFUG4/item-list' });;
		server.use(
			http.get('https://www.zotero.org/styles/modern-language-association', () => {
				return HttpResponse.text(modernLanguageAssociationStyle, {
					headers: { 'Content-Type': 'application/vnd.citationstyles.style+xml' },
				});
			}),
		);
		server.use(
			http.get('https://www.zotero.org/styles/turabian-notes-bibliography', () => {
				return HttpResponse.text(turabianNotesStyle, {
					headers: { 'Content-Type': 'application/vnd.citationstyles.style+xml' },
				});
			}),
		);
		server.use(
			http.get('https://www.zotero.org/styles/chicago-notes-bibliography-subsequent-author-title-17th-edition', () => {
				return HttpResponse.text(chicagoStyle, {
					headers: { 'Content-Type': 'application/vnd.citationstyles.style+xml' },
				});
			}),
		);
	});

	afterEach(() => server.resetHandlers());

	afterAll(() => {
		uninstallMockedXHR();
		server.close();
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

		let hasBeenRequested = false;

		server.use(
			http.get('https://api.zotero.org/users/1/items', async ({request}) => {
				const url = new URL(request.url);
				expect(url.searchParams.get('format')).toEqual('bibtex');
				expect(url.searchParams.get('includeTrashed')).toEqual('1');
				expect(url.searchParams.get('itemKey')).toEqual('J489T6X3,3JCLFUG4');

				hasBeenRequested = true;
				return HttpResponse.text('');
			}),
		);

		const bibtexOpt = screen.getByRole('menuitem', { name: 'BibTeX' });
		await userEvent.click(bibtexOpt);
		await waitForPosition();

		expect(hasBeenRequested).toBe(true);
		expect(fileSaver.saveAs).toHaveBeenCalledTimes(1);
	});

	test('Generate citations for selected items using toolbar', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const createCitationsBtn = screen.getByRole('button', { name: 'Create Citations' });
		await userEvent.click(createCitationsBtn);
		await waitForPosition();

		const dialog = await screen.findByRole('dialog', { name: 'Copy Citation' });

		expect(await findByText(dialog, '(Foead et al.; Silver)')).toBeInTheDocument();
	});

	test('Generate bibliography for selected items using toolbar', async () => {
		renderWithProviders(<MainZotero />, { preloadedState: state });
		await waitForPosition();

		const createBibliographyBtn = screen.getByRole('button', { name: 'Create Bibliography' });
		await userEvent.click(createBibliographyBtn);
		await waitForPosition();

		const dialog = await screen.findByRole('dialog', { name: 'Bibliography' });

		expect(
			await findByText(dialog, /Foead, Daniel, et al\./, {})
		).toBeInTheDocument();
		expect(
			await findByText(dialog, /Silver, David/, {})
		).toBeInTheDocument();

		const styleComboBox = screen.getByRole('combobox', { name: 'Citation Style' });
		await userEvent.click(styleComboBox);
		const option = getByRole(getByRole(styleComboBox, 'listbox'), 'option', { name: /Turabian/ });
		await userEvent.click(option);

		expect(
			await findByText(dialog, 'Foead, Daniel, Alifio Ghifari, Marchel Budi Kusuma, Novita Hanafiah, and Eric Gunawan. “A Systematic Literature Review of A* Pathfinding.”', { exact: false })
		).toBeInTheDocument();

		const langComboBox = screen.getByRole('combobox', { name: 'Language' });
		await userEvent.click(langComboBox);
		await userEvent.selectOptions(getByRole(langComboBox, 'listbox'), 'Polish');

		expect(
			await findByText(dialog, 'Foead, Daniel, Alifio Ghifari, Marchel Budi Kusuma, Novita Hanafiah, i Eric Gunawan. „A systematic literature review of A* pathfinding”.', { exact: false })
		).toBeInTheDocument();
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

		window.open = jest.fn();

		const subscribeToFeedBtn = screen.getByRole('menuitem', { name: 'Subscribe To Feed' });
		await userEvent.click(subscribeToFeedBtn);

		await waitFor(() => expect(window.open)
			.toHaveBeenCalledWith('https://www.zotero.org/settings/keys/new?name=Private%20Feed&library_access=1&notes_access=1&redirect=https%3A%2F%2Fapi.zotero.org%2Fusers%2F1%2Fitems%2Ftop%3Fdirection%3Dasc%26format%3Datom%26q%3Dpathfinding%26qmode%3DtitleCreatorYear%26sort%3Dtitle%26tag%3Dto%2520read')
		);
	});

});

import fs from 'fs/promises';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, loadFixtureState} from "../utils/fixed-state-server.js";
import citationStylesData from '../../data/citation-styles-data.json' assert { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const NONSENSE_STYLE = 'no-such-citation-style';
const DEFAULT_STYLE = citationStylesData.coreCitationStyles.find(cs => cs.isDefault);
const TURABIAN_STYLE = citationStylesData.coreCitationStyles.find(cs => cs.name === 'turabian-notes-bibliography');
// one initial attempt plus three retries, spaced 1s, 2s and 5s apart
const EXPECTED_STYLE_REQUESTS = 4;
const RETRIES_TIMEOUT = 15000;

const seedCitationStyle = async (page, citationStyle) => {
	const {version} = JSON.parse(await fs.readFile(join(ROOT, 'data/version.json'), 'utf-8'));
	await page.addInitScript(({citationStyle, version}) => {
		window.localStorage.setItem('zotero-web-library-prefs', JSON.stringify({citationStyle, version}));
	}, {citationStyle, version});
};

const readStoredCitationStyle = page => page.evaluate(
	() => JSON.parse(window.localStorage.getItem('zotero-web-library-prefs')).citationStyle
);

// Counts requests made for a given style, as a function so it always reads the current value
const countStyleRequests = (page, styleName) => {
	let count = 0;
	page.on('request', request => {
		if (request.url().includes(`/_csl/${styleName}`)) {
			count++;
		}
	});
	return () => count;
};

test.describe('Desktop Bibliography', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('Falls back to the default style when the preferred style cannot be downloaded', async ({ page, serverPort }) => {
		test.slow(); // waits out the retry schedule
		await seedCitationStyle(page, NONSENSE_STYLE);
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);
		const getStyleRequestsCount = countStyleRequests(page, NONSENSE_STYLE);

		await page.getByRole('button', { name: 'Create Bibliography' }).click();

		// Failed attempts are retried quietly, no error is shown while retries are still pending
		const errorMessages = page.locator('.messages .message.error');
		await expect.poll(getStyleRequestsCount).toBeGreaterThanOrEqual(2);
		await expect(errorMessages).toHaveCount(0);

		// Once all attempts have failed, a single error explains the fallback, without leaking the URL
		const errorMessage = errorMessages.filter({ hasText: NONSENSE_STYLE });
		await expect(errorMessage).toBeVisible({ timeout: RETRIES_TIMEOUT });
		expect(getStyleRequestsCount()).toBe(EXPECTED_STYLE_REQUESTS);
		await expect(errorMessages).toHaveCount(1);
		await expect(errorMessage).toContainText('could not be downloaded');
		await expect(errorMessage).toContainText(DEFAULT_STYLE.title);
		await expect(errorMessage).not.toContainText('http');

		// The modal should still open, rather than remaining stuck on the loading backdrop
		const modal = page.getByRole('dialog', { name: 'Bibliography' });
		await expect(modal).toBeVisible();

		// The unusable style should have been replaced with the default one in the selector only
		const styleCombobox = modal.getByRole('combobox', { name: 'Citation Style' });
		await expect(styleCombobox.locator('.select-value-label')).toHaveText(DEFAULT_STYLE.title);
		expect(await readStoredCitationStyle(page)).toBe(NONSENSE_STYLE);

		// No further attempts are made once the fallback style is in use
		await page.waitForTimeout(1500);
		expect(getStyleRequestsCount()).toBe(EXPECTED_STYLE_REQUESTS);
	});

	test('Closes the modal when the default style cannot be downloaded either', async ({ page, serverPort }) => {
		test.slow(); // waits out the retry schedule twice
		await seedCitationStyle(page, NONSENSE_STYLE);
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);
		await page.route(`**/_csl/${DEFAULT_STYLE.name}`, route => route.fulfill({ status: 404, body: 'Not Found' }));
		const getStyleRequestsCount = countStyleRequests(page, NONSENSE_STYLE);
		const getDefaultStyleRequestsCount = countStyleRequests(page, DEFAULT_STYLE.name);

		await page.getByRole('button', { name: 'Create Bibliography' }).click();

		// The loading backdrop stays up while both the preferred and the default style are being retried
		const loadingBackdrop = page.locator('.modal-backdrop.loading');
		await expect(loadingBackdrop).toBeVisible();

		const errorMessages = page.locator('.messages .message.error');
		await expect(errorMessages.filter({ hasText: NONSENSE_STYLE })).toBeVisible({ timeout: RETRIES_TIMEOUT });
		await expect(loadingBackdrop).toBeVisible();

		const fallbackErrorMessage = errorMessages.filter({ hasText: 'could not be downloaded either' });
		await expect(fallbackErrorMessage).toBeVisible({ timeout: RETRIES_TIMEOUT });
		await expect(fallbackErrorMessage).toContainText(DEFAULT_STYLE.title);
		await expect(errorMessages).toHaveCount(2);
		expect(getStyleRequestsCount()).toBe(EXPECTED_STYLE_REQUESTS);
		expect(getDefaultStyleRequestsCount()).toBe(EXPECTED_STYLE_REQUESTS);

		// With no style to render, the modal closes instead of remaining stuck on the loading backdrop
		await expect(page.locator('.modal-backdrop')).toHaveCount(0);
		await expect(page.getByRole('dialog', { name: 'Bibliography' })).toHaveCount(0);
		expect(await readStoredCitationStyle(page)).toBe(NONSENSE_STYLE);

		// Opening the modal again starts a fresh attempt at the preferred style
		await page.getByRole('button', { name: 'Create Bibliography' }).click();
		await expect(loadingBackdrop).toBeVisible();
		await expect.poll(getStyleRequestsCount).toBe(EXPECTED_STYLE_REQUESTS + 1);
	});

	test('Ignores the outcome of a superseded download of the same style', async ({ page, serverPort }) => {
		test.slow(); // waits out the retry schedule
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// The first three attempts at Turabian fail at once. The final retry is held until the test releases
		// it, so a second download of the same style can be requested and succeed while it is still pending.
		let turabianRequestsCount = 0;
		let releaseFinalRetry;
		const finalRetryReleased = new Promise(resolve => { releaseFinalRetry = resolve; });
		await page.route(`**/_csl/${TURABIAN_STYLE.name}`, async route => {
			turabianRequestsCount++;
			if (turabianRequestsCount > EXPECTED_STYLE_REQUESTS) {
				return route.continue();
			}
			if (turabianRequestsCount === EXPECTED_STYLE_REQUESTS) {
				await finalRetryReleased;
			}
			return route.fulfill({ status: 404, body: 'Not Found' });
		});

		await page.getByRole('button', { name: 'Create Bibliography' }).click();
		const modal = page.getByRole('dialog', { name: 'Bibliography' });
		await expect(modal).toBeVisible();
		const styleCombobox = modal.getByRole('combobox', { name: 'Citation Style' });
		const selectedStyle = styleCombobox.locator('.select-value-label');
		await expect(selectedStyle).toHaveText(DEFAULT_STYLE.title);
		const readBibliography = () => modal.locator('.bibliography').innerText();
		const defaultBibliography = await readBibliography();

		const selectStyle = async title => {
			await styleCombobox.click();
			await page.getByRole('option', { name: title }).click();
		};

		await selectStyle(TURABIAN_STYLE.title);
		await expect.poll(() => turabianRequestsCount, { timeout: RETRIES_TIMEOUT }).toBe(EXPECTED_STYLE_REQUESTS);

		// Switch away and back while the final retry is pending. This time the download succeeds.
		await selectStyle(DEFAULT_STYLE.title);
		await expect(selectedStyle).toHaveText(DEFAULT_STYLE.title);
		await selectStyle(TURABIAN_STYLE.title);
		await expect.poll(() => turabianRequestsCount).toBe(EXPECTED_STYLE_REQUESTS + 1);
		await expect(selectedStyle).toHaveText(TURABIAN_STYLE.title);
		await expect.poll(readBibliography, { timeout: RETRIES_TIMEOUT }).not.toBe(defaultBibliography);
		const turabianBibliography = await readBibliography();

		// The stale failure must not clear the loaded style, show an error, or fall back to the default
		const finalRetryResponse = page.waitForResponse(
			response => response.url().includes(`/_csl/${TURABIAN_STYLE.name}`) && response.status() === 404
		);
		releaseFinalRetry();
		await finalRetryResponse;
		await page.waitForTimeout(1000);
		await expect(page.locator('.messages .message.error')).toHaveCount(0);
		await expect(selectedStyle).toHaveText(TURABIAN_STYLE.title);
		await expect(modal.locator('.bibliography')).toHaveText(turabianBibliography);
		expect(turabianRequestsCount).toBe(EXPECTED_STYLE_REQUESTS + 1);
	});
});

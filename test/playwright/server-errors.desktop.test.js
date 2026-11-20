import { test, expect } from "../utils/playwright-fixtures.js";
import { closeServer, loadFixtureState, makeCustomHandler } from "../utils/fixed-state-server.js";
import searchByIdentifier from '../fixtures/response/search-by-identifier.json' with { type: 'json' };

const isItemsWrite = url => new URL(url).pathname === '/api/users/1/items';
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('API server errors', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	const cases = [
		{
			status: 500,
			body: 'An error occurred',
			message: 'The Zotero server is temporarily unable to process this request. Please try again later.',
		},
		{
			status: 502,
			body: '<html><head><title>502 Bad Gateway</title></head><body>502 Bad Gateway</body></html>',
			message: 'The Zotero server is temporarily unable to process this request. Please try again later.',
		},
		{
			status: 503,
			body: 'Server updates in progress. Please try again in a few minutes.',
			message: 'Server updates in progress. Please try again in a few minutes.',
		},
	];

	for (const { status, body, message } of cases) {
		test(`Show a message when saving an item found by identifier keeps failing with ${status}`, async ({ page, serverPort }) => {
			const handlers = [
				makeCustomHandler('/_translate/search', searchByIdentifier),
			];
			server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, handlers);

			let createAttempts = 0;
			await page.route(isItemsWrite, route => {
				if (route.request().method() !== 'POST') {
					return route.fallback();
				}
				createAttempts++;
				return route.fulfill({
					status,
					contentType: 'text/plain',
					body,
					headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': '*' },
				});
			});

			await page.getByRole('button', { name: 'Add By Identifier' }).click();
			const dialog = page.getByRole('dialog', { name: 'Add By Identifier' });
			await dialog.getByRole('textbox', { name: /Enter a URL/ }).fill('0312558066');
			await page.keyboard.press('Enter');

			// api client retries 5xx twice, with backoff, before giving up
			await expect(page.locator('.messages .message'))
				.toHaveText(new RegExp(`^Error\\s*${escapeRegExp(message)}$`), { timeout: 10000 });
			expect(createAttempts).toBe(3);
		});
	}
});

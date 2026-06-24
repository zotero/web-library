import { closeServer, generateTestItems, loadFixtureState, makeCustomHandler, makeFulltextReindexingHandlers } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait } from '../utils/common.js';

test.describe('Desktop full-text reindexing snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('renders the in-progress ring and popover', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			// Stays "reindexing" with stable counts so the ring + "(2/4)" hold still
			// for the screenshot.
			items,
			sequence: [ { status: 'reindexing', indexedCount: 2, expectedCount: 4 } ],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		await page.getByRole('button', { name: 'Search Mode' }).click();
		await page.getByRole('menuitem', { name: 'Title, Creator, Year + Full-Text Content' }).click();
		const searchBox = page.getByRole('searchbox', { name: /Title, Creator, Year/ });
		await searchBox.click();
		await searchBox.fill('reindex');

		// The popover auto-opens on reindex start; wait for the in-progress count.
		const dialog = page.getByRole('dialog', { name: 'Rebuilding full-text index' });
		await expect(dialog.getByText('Preparing full-text search (2/4)')).toBeVisible({ timeout: 10000 });

		await wait(500); // settle popover transition + icons
		await expect(page).toHaveScreenshot('desktop-fulltext-reindexing-in-progress.png');
		await page.close();
	});
});

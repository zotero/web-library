import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, generateTestItems, loadFixtureState, makeCustomHandler, makeFulltextReindexingHandlers, makeGate, makeGatedHandler} from "../utils/fixed-state-server.js";

const EVERYTHING_MODE = 'Title, Creator, Year + Full-Text Content';

// Open the touch search bar, switch to the "everything" search mode and run a
// search, producing a `qmode=everything` request the reindexing handlers respond to.
async function runEverythingSearchTouch(page, term) {
	await page.getByRole('button', { name: 'Toggle search' }).click();
	await page.getByRole('button', { name: 'Search Mode' }).click();
	await page.getByRole('menuitem', { name: EVERYTHING_MODE }).click();
	const searchBox = page.getByRole('searchbox', { name: /Title, Creator, Year/ });
	await searchBox.click();
	await searchBox.fill(term);
	return searchBox;
}

test.describe('Full-text reindexing (touch)', () => {
	let server;

	test.beforeEach(() => {
		test.skip(!/iPhone|Android/.test(test.info().project.name),
			'single-column touch search flow (two mounted search inputs)');
	});

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('runs a single status poll despite two mounted search inputs', async ({ page, serverPort }) => {
		const gate = makeGate();
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [ { status: 'reindexing', indexedCount: 1, expectedCount: 4 } ],
		});
		// Hold the status response open so the poll stays in flight. Before the engine
		// was lifted to a single owner, each mounted indicator polled independently, so
		// two requests would be held at once.
		const gatedStatus = makeGatedHandler(
			'/api/users/1/fulltext/index',
			{ status: 'reindexing', indexedCount: 1, expectedCount: 4 },
			gate,
		);
		const handlers = [gatedStatus, ...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, handlers);

		const statusGets = [];
		page.on('request', req => {
			if (req.url().includes('/fulltext/index') && req.method() === 'GET') {
				statusGets.push(req.url());
			}
		});

		await runEverythingSearchTouch(page, 'reindex');

		await expect(page.getByRole('button', { name: 'Rebuilding full-text index' })).toBeVisible({ timeout: 10000 });
		await expect.poll(() => statusGets.length, { timeout: 10000 }).toBeGreaterThanOrEqual(1);

		// Across several poll intervals exactly one request is outstanding -- one owner,
		// not one per mounted search input.
		await page.waitForTimeout(3500);
		expect(statusGets.length).toBe(1);

		gate.release();
	});

	test('only the visible indicator opens its popover', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			// Stays "reindexing" so the indicator persists for the assertions below.
			sequence: [ { status: 'reindexing', indexedCount: 2, expectedCount: 4 } ],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, handlers);

		await runEverythingSearchTouch(page, 'reindex');

		await expect(page.getByRole('button', { name: 'Rebuilding full-text index' })).toBeVisible({ timeout: 10000 });

		// Both Search instances render a popover (portaled to <body>), but only the
		// visible touch indicator auto-opens; the CSS-hidden navbar one stays a closed
		// (aria-hidden) dialog, so exactly one dialog is open. Scope the body text to
		// that open dialog -- the closed one keeps its text in the DOM too.
		const dialog = page.getByRole('dialog', { name: 'Rebuilding full-text index' });
		await expect(dialog).toHaveCount(1);
		await expect(dialog.getByText('Preparing full-text search (2/4)')).toBeVisible();
	});
});

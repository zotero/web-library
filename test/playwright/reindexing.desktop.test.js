import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, generateTestItems, loadFixtureState, makeCustomHandler, makeFulltextReindexingHandlers, makeGate, makeGatedHandler} from "../utils/fixed-state-server.js";

const EVERYTHING_MODE = 'Title, Creator, Year + Full-Text Content';

// Switch to the "everything" search mode and run a search, which produces a
// `qmode=everything` request the reindexing handlers respond to.
async function runEverythingSearch(page, term) {
	await page.getByRole('button', { name: 'Search Mode' }).click();
	await page.getByRole('menuitem', { name: EVERYTHING_MODE }).click();
	const searchBox = page.getByRole('searchbox', { name: /Title, Creator, Year/ });
	await searchBox.click();
	await searchBox.fill(term);
	return searchBox;
}

test.describe('Full-text reindexing', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('shows progress and re-runs the search when the index is rebuilt', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 1, expectedCount: 4 },
				{ status: 'reindexing', indexedCount: 3, expectedCount: 4 },
				{ status: 'indexed', indexedCount: 4, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const everythingRequests = [];
		page.on('request', req => {
			if (req.url().includes('qmode=everything')) {
				everythingRequests.push(req.url());
			}
		});

		await runEverythingSearch(page, 'reindex');

		// The indicator appears in response to the Zotero-Full-Text-Reindexing header.
		await expect(page.getByRole('button', { name: 'Rebuilding full-text index' })).toBeVisible({ timeout: 10000 });

		// The ring reflects progress reported by successive fulltext/index responses.
		const progressbar = page.getByRole('progressbar');
		await expect(progressbar).toBeVisible({ timeout: 10000 });
		await expect(progressbar).toHaveAttribute('aria-valuemax', '4');
		await expect.poll(
			async () => Number(await progressbar.getAttribute('aria-valuenow')),
			{ timeout: 10000 }
		).toBeGreaterThanOrEqual(3);

		const searchesBeforeCompletion = everythingRequests.length;

		// On completion the tick replaces the ring...
		await expect(page.getByRole('button', { name: 'Full-text index rebuilt' })).toBeVisible({ timeout: 10000 });

		// ...and the search is re-run to pull the now-complete results.
		await expect.poll(() => everythingRequests.length, { timeout: 10000 })
			.toBeGreaterThan(searchesBeforeCompletion);
	});

	test('popover opens automatically and shows indexed and expected counts', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			// Stays "reindexing" so the indicator persists for the assertions below.
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		await runEverythingSearch(page, 'reindex');

		const indicator = page.getByRole('button', { name: 'Rebuilding full-text index' });
		await expect(indicator).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('progressbar')).toBeVisible({ timeout: 10000 });

		// The popover opens by itself when the rebuild starts -- no click needed.
		await expect(page.getByText('Preparing full-text search (2/4)')).toBeVisible({ timeout: 10000 });
	});

	test('popover reopens automatically when the rebuild finishes', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 1, expectedCount: 4 },
				{ status: 'reindexing', indexedCount: 3, expectedCount: 4 },
				{ status: 'indexed', indexedCount: 4, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		await runEverythingSearch(page, 'reindex');

		// Opens by itself on start; dismiss it by toggling the indicator off.
		const indicator = page.getByRole('button', { name: 'Rebuilding full-text index' });
		await expect(indicator).toBeVisible({ timeout: 10000 });
		await expect(page.getByText(/Preparing full-text search/)).toBeVisible({ timeout: 10000 });
		await indicator.click();
		await expect(page.getByText(/Preparing full-text search/)).toBeHidden();

		// On completion it reopens by itself with the completed message.
		await expect(page.getByRole('button', { name: 'Full-text index rebuilt' })).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('Full-text search is up to date.')).toBeVisible();
	});

	test('the close button inside the popover dismisses it', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			// Stays "reindexing" so the popover does not reopen on its own after we close it.
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		await runEverythingSearch(page, 'reindex');

		// Auto-opens on start.
		const popover = page.getByRole('dialog', { name: 'Rebuilding full-text index' });
		await expect(popover).toBeVisible({ timeout: 10000 });
		await expect(popover.getByText('Preparing full-text search (2/4)')).toBeVisible();

		// The X inside the popover closes it.
		await popover.getByRole('button', { name: 'Close' }).click();
		await expect(popover).toBeHidden();

		// Dismissing mid-rebuild only closes the popover -- the indicator stays,
		// since it is still driven by the in-progress rebuild.
		await expect(page.getByRole('button', { name: 'Rebuilding full-text index' })).toBeVisible();
	});

	test('the completed indicator stays until its popover is dismissed', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
				{ status: 'indexed', indexedCount: 4, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		await runEverythingSearch(page, 'reindex');

		// The completed indicator appears and -- with no timed auto-hide -- persists.
		const rebuilt = page.getByRole('button', { name: 'Full-text index rebuilt' });
		await expect(rebuilt).toBeVisible({ timeout: 10000 });

		// Dismissing its popover removes the indicator entirely.
		await page.getByRole('dialog', { name: 'Full-text index rebuilt' })
			.getByRole('button', { name: 'Close' }).click();
		await expect(rebuilt).toBeHidden();
	});

	test('shows a spinner and defers the tick until the re-run search settles', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
				{ status: 'indexed', indexedCount: 4, expectedCount: 4 },
			],
		});

		// Hold the post-completion re-run search open so it stays in flight. The
		// `indexed` poll has cleared `isReindexing`, but the tick must not appear until
		// this re-run settles -- the spinner stands in for it meanwhile.
		const gate = makeGate();
		const heldReRun = makeGatedHandler('/api/', items, gate, { totalResults: 4, version: 1000000 });
		let queriesSeen = 0;
		const reRunGate = (req, resp) => {
			if (req.method === 'OPTIONS' || !req.url.includes('qmode=everything')) {
				return false;
			}
			queriesSeen += 1;
			if (queriesSeen === 1) {
				return false;
			}
			return heldReRun(req, resp);
		};
		const handlers = [reRunGate, ...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		await runEverythingSearch(page, 'reindex');

		// The index finished building, but the re-run search is held: the spinner shows,
		// the popover now reads as running the search, and the completed tick is withheld
		// until the re-run settles.
		await expect(page.locator('.fulltext-reindexing-progress .icon-spin')).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('dialog', { name: 'Rebuilding full-text index' })
			.getByText(/Running full-text search/)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Full-text index rebuilt' })).toBeHidden();

		// Releasing the held re-run swaps the spinner for the tick and the up-to-date message.
		gate.release();
		await expect(page.getByRole('button', { name: 'Full-text index rebuilt' })).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('dialog', { name: 'Full-text index rebuilt' })
			.getByText('Full-text search is up to date.')).toBeVisible();
		await expect(page.locator('.fulltext-reindexing-progress .icon-spin')).toBeHidden();
	});

	test('the completed indicator is removed when a new search term is entered', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
				{ status: 'indexed', indexedCount: 4, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const searchBox = await runEverythingSearch(page, 'reindex');

		const rebuilt = page.getByRole('button', { name: 'Full-text index rebuilt' });
		await expect(rebuilt).toBeVisible({ timeout: 10000 });

		// Entering a different search term clears the completed indicator.
		await searchBox.fill('something else');
		await expect(rebuilt).toBeHidden({ timeout: 10000 });
	});

	test('the indicator is removed and polling stops when the items source is no longer a query', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			// Never completes, so polling would otherwise continue indefinitely.
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const statusRequests = [];
		page.on('request', req => {
			if (req.url().includes('/fulltext/index')) {
				statusRequests.push(req.url());
			}
		});

		await runEverythingSearch(page, 'reindex');

		// Indicator is up and the status endpoint is being polled.
		const indicator = page.getByRole('button', { name: 'Rebuilding full-text index' });
		await expect(indicator).toBeVisible({ timeout: 10000 });
		await expect.poll(() => statusRequests.length, { timeout: 10000 }).toBeGreaterThan(0);

		// Selecting a collection switches the items source away from the query, which
		// removes the indicator...
		await page.getByRole('treeitem', { name: 'AI' }).click();
		await expect(indicator).toBeHidden();

		// ...and stops the polling: no further status requests after a poll interval.
		const polledSoFar = statusRequests.length;
		await page.waitForTimeout(3000);
		expect(statusRequests.length).toBe(polledSoFar);
	});

	test('the indicator is removed and polling stops when the search mode is no longer full-text', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			// Never completes, so polling would otherwise continue indefinitely.
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
			],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const statusRequests = [];
		page.on('request', req => {
			if (req.url().includes('/fulltext/index')) {
				statusRequests.push(req.url());
			}
		});

		await runEverythingSearch(page, 'reindex');

		// Indicator is up and the status endpoint is being polled.
		const indicator = page.getByRole('button', { name: 'Rebuilding full-text index' });
		await expect(indicator).toBeVisible({ timeout: 10000 });
		await expect.poll(() => statusRequests.length, { timeout: 10000 }).toBeGreaterThan(0);

		// The popover auto-opens on start and is sticky while rebuilding; toggle it off the
		// indicator so it doesn't overlay the search-mode menu.
		await expect(page.getByText(/Preparing full-text search/)).toBeVisible({ timeout: 10000 });
		await indicator.click();
		await expect(page.getByText(/Preparing full-text search/)).toBeHidden();

		// Switching the search mode away from "everything" keeps the query term but is treated
		// like navigating away: the indicator is removed...
		await page.getByRole('button', { name: 'Search Mode' }).click();
		await page.getByRole('menuitem', { name: 'Title, Creator, Year', exact: true }).click();
		await expect(indicator).toBeHidden({ timeout: 10000 });

		// ...and stops the polling: no further status requests after a poll interval.
		const polledSoFar = statusRequests.length;
		await page.waitForTimeout(3000);
		expect(statusRequests.length).toBe(polledSoFar);
	});

	test('does not stack status polls while a request is still in flight', async ({ page, serverPort }) => {
		const gate = makeGate();
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 1, expectedCount: 4 },
			],
		});
		// Hold the status response open so the poll stays in flight. This gated
		// handler is listed first, so it answers the status request ahead of the
		// reindex bundle's own (immediate) index handler.
		const gatedStatus = makeGatedHandler(
			'/api/users/1/fulltext/index',
			{ status: 'reindexing', indexedCount: 1, expectedCount: 4 },
			gate,
		);
		const handlers = [gatedStatus, ...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const statusGets = [];
		page.on('request', req => {
			if (req.url().includes('/fulltext/index') && req.method() === 'GET') {
				statusGets.push(req.url());
			}
		});

		await runEverythingSearch(page, 'reindex');

		// Polling has started and the first status request has fired (and is held).
		await expect(page.getByRole('button', { name: 'Rebuilding full-text index' })).toBeVisible({ timeout: 10000 });
		await expect.poll(() => statusGets.length, { timeout: 10000 }).toBeGreaterThanOrEqual(1);

		// Across several poll intervals no second request is made, because the
		// first has not returned yet.
		await page.waitForTimeout(3500);
		expect(statusGets.length).toBe(1);

		// Release so the held response settles before teardown.
		gate.release();
	});

	test('ignores outside clicks while the index is rebuilding', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			// Stays "reindexing" so the sticky state persists for the assertion.
			sequence: [ { status: 'reindexing', indexedCount: 2, expectedCount: 4 } ],
		});
		const handlers = [...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const searchBox = await runEverythingSearch(page, 'reindex');

		// Auto-opens on start.
		const popover = page.getByRole('dialog', { name: 'Rebuilding full-text index' });
		await expect(popover.getByText('Preparing full-text search (2/4)')).toBeVisible({ timeout: 10000 });

		// Clicking outside the popover (back in the search box -- neither the X nor the
		// trigger) is ignored while rebuilding, so the popover stays open.
		await searchBox.click();
		await page.waitForTimeout(300);
		await expect(popover.getByText('Preparing full-text search (2/4)')).toBeVisible();
	});

	test('ignores outside clicks while refreshing, then honours them once complete', async ({ page, serverPort }) => {
		const items = generateTestItems(4, { keyPrefix: 'FTR', titlePrefix: 'Reindex' });
		const reindex = makeFulltextReindexingHandlers({
			indexUrl: '/api/users/1/fulltext/index',
			items,
			sequence: [
				{ status: 'reindexing', indexedCount: 2, expectedCount: 4 },
				{ status: 'indexed', indexedCount: 4, expectedCount: 4 },
			],
		});
		// Hold the post-rebuild re-run so the refreshing (spinner) stage persists.
		const gate = makeGate();
		const heldReRun = makeGatedHandler('/api/', items, gate, { totalResults: 4, version: 1000000 });
		let queriesSeen = 0;
		const reRunGate = (req, resp) => {
			if (req.method === 'OPTIONS' || !req.url.includes('qmode=everything')) {
				return false;
			}
			queriesSeen += 1;
			if (queriesSeen === 1) {
				return false;
			}
			return heldReRun(req, resp);
		};
		const handlers = [reRunGate, ...reindex.handlers, makeCustomHandler('/api/', [], { totalResults: 0 })];
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, handlers);

		const searchBox = await runEverythingSearch(page, 'reindex');

		// Refreshing (spinner) stage: an outside click is still ignored.
		const popover = page.getByRole('dialog', { name: 'Rebuilding full-text index' });
		await expect(popover.getByText(/Running full-text search/)).toBeVisible({ timeout: 10000 });
		await searchBox.click();
		await page.waitForTimeout(300);
		await expect(popover.getByText(/Running full-text search/)).toBeVisible();

		// Once complete the popover reopens, and an outside click dismisses it again.
		gate.release();
		const donePopover = page.getByRole('dialog', { name: 'Full-text index rebuilt' });
		await expect(donePopover.getByText('Full-text search is up to date.')).toBeVisible({ timeout: 10000 });
		await searchBox.click();
		await expect(page.getByRole('button', { name: 'Full-text index rebuilt' })).toBeHidden();
	});
});

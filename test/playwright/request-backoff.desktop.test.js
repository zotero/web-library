import { test, expect } from "../utils/playwright-fixtures.js";
import { closeServer, generateTestItems, loadFixtureState, makeCustomHandler, makePaginatedHandler } from "../utils/fixed-state-server.js";

const COLLECTION_KEY = 'CSB4KZUU';
const COLLECTION_ITEMS_PATH = `/api/users/1/collections/${COLLECTION_KEY}/items/top`;

// Serves the first page (start=0) from a paginated item set and fails every subsequent page
// with a 400. The first failure puts the request type into requestWithBackoff's backoff
// window; while it is active, every new page request is queued and synchronously drops the
// previously queued one (there is a single waiting slot per request type).
function makeFirstPageOnlyHandler(urlPath, allItems) {
	const paginated = makePaginatedHandler(urlPath, allItems);
	let failedCount = 0;
	const handler = (req, resp) => {
		const parsedUrl = new URL(req.url, 'http://localhost');
		if (parsedUrl.pathname !== urlPath) {
			return false;
		}
		const start = parseInt(parsedUrl.searchParams.get('start') || '0');
		if (req.method !== 'OPTIONS' && start > 0) {
			failedCount++;
			resp.statusCode = 400;
			resp.setHeader('Access-Control-Allow-Origin', '*');
			resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
			resp.setHeader('Access-Control-Allow-Headers', '*');
			resp.setHeader('Access-Control-Expose-Headers', '*');
			resp.end('Bad Request');
			return true;
		}
		return paginated(req, resp);
	};
	handler.getFailedCount = () => failedCount;
	return handler;
}

test.describe('Request backoff', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	// With ITEMS_IN_COLLECTION in the API-error backoff window, scrolling the items table
	// into unfetched rows makes useInfiniteLoader request a new range while another is
	// queued. Queueing the new range synchronously DROPs the queued one, which in turn triggers
	// a change of isItemLoaded's identity, resets the loader and immediately re-requests them,
	// dropping the newer range in turn. The result is a synchronous REQUEST/DROP loop commits on
	// every cycle until React throws "Maximum update depth exceeded".
	test('scrolling into unfetched items during backoff must not crash the items table', async ({ page, serverPort }) => {
		const items = generateTestItems(300, { keyPrefix: 'BCKF', titlePrefix: 'Backoff Item', collections: [COLLECTION_KEY] });
		const collectionItemsHandler = makeFirstPageOnlyHandler(COLLECTION_ITEMS_PATH, items);
		const handlers = [
			collectionItemsHandler,
			// catch-all for any other API requests (e.g. tags)
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];

		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		page.on('console', message => {
			if (message.type() === 'error') {
				errors.push(message.text());
			}
		});

		server = await loadFixtureState('desktop-test-user-library-view', serverPort, page, handlers);

		await page.getByRole('treeitem', { name: 'Algorithms' }).click();

		// The first page (start=0) loads with Total-Results: 300, leaving rows 23-299
		// unfetched, so the infinite loader immediately requests the rows just below the
		// fold. That request fails with a 400, opening the backoff window;
		await expect(page.getByRole('row', { name: 'Backoff Item 000' })).toBeVisible();
		await expect.poll(() => collectionItemsHandler.getFailedCount()).toBeGreaterThan(0);

		// Scroll down in viewport-sized steps.
		for (let i = 1; i <= 3; i++) {
			await page.evaluate(scrollTop => {
				const el = document.querySelector('.items-table-body');
				if (el) {
					el.scrollTop = scrollTop;
				}
			}, i * 500);
			await page.waitForTimeout(250);
		}

		expect(errors.filter(text => /Maximum update depth|Minified React error #185/.test(text))).toEqual([]);
		await expect(page.locator('.crash-handler')).toHaveCount(0);

		// The table must still be alive: scrolling back up shows the fetched first page.
		await page.evaluate(() => {
			const el = document.querySelector('.items-table-body');
			if (el) {
				el.scrollTop = 0;
			}
		});
		await expect(page.getByRole('row', { name: 'Backoff Item 000' })).toBeVisible();
	});
});

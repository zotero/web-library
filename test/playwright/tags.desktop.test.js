import { test, expect } from '../utils/playwright-fixtures.js';
import { closeServer, getServer, generateTestItems, generateTestTags, makeCustomHandler, makePaginatedHandler } from '../utils/fixed-state-server.js';
import { getPatchedState, getStateWithout } from '../utils/state.js';
import { waitForLoad } from '../utils/common.js';

// Navigate to an arbitrary path (e.g. a URL with a pre-selected tag) on a fixed-state server.
async function loadFixtureAtPath(stateName, path, serverPort, page, handlers = [], opts = {}) {
	const server = await getServer(stateName, serverPort, handlers, opts);
	await page.goto(`http://localhost:${serverPort}/${path}`);
	await waitForLoad(page);
	await page.waitForLoadState('networkidle');
	return server;
}

// Serve `count` generated tags as the top-level tag source and drop any colored tags, so the desktop
// tag selector list is deterministic regardless of the fixture's own tags. The same endpoint also
// serves the query-scoped request issued once a tag is selected.
const withGeneratedTags = count => {
	const handlers = [
		makePaginatedHandler('/api/users/1/items/top/tags', generateTestTags(count)),
		makeCustomHandler('/api/', [], { totalResults: 0 }), // catch-all for filtered item requests
	];
	const patchState = state => {
		let s = getStateWithout(state, 'libraries.u1.tagsTop');
		return getPatchedState(s, 'libraries.u1.tagColors', { value: [], lookup: {} });
	};
	return { handlers, patchState };
};

test.describe('Desktop Tag Selector -- pre-selected tags shown first', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('A pre-selected tag beyond the first fetched page is shown first and not duplicated', async ({ page, serverPort }) => {
		const { handlers, patchState } = withGeneratedTags(150);
		server = await loadFixtureAtPath('desktop-test-user-library-view', 'testuser/tags/Tag%20149', serverPort, page, handlers, { patchState });

		const selectedList = page.locator('.tag-selector-list.selected-tags');
		const mainList = page.locator('.tag-selector-container .tag-selector-list:not(.selected-tags)');

		// The selected tag surfaces in the dedicated selected row even though only the first page
		// (Tag 000..Tag 099) has been fetched.
		await expect(selectedList.getByRole('button', { name: 'Tag 149', exact: true })).toBeVisible();

		// It is not duplicated in the main list, while first-page tags are shown there.
		await expect(mainList.getByRole('button', { name: 'Tag 000', exact: true })).toBeVisible();
		await expect(mainList.getByRole('button', { name: 'Tag 149', exact: true })).toHaveCount(0);
	});

	test('Deselecting a tag returns it to its place in the list', async ({ page, serverPort }) => {
		const { handlers, patchState } = withGeneratedTags(10);
		server = await loadFixtureAtPath('desktop-test-user-library-view', 'testuser/tags/Tag%20005', serverPort, page, handlers, { patchState });

		const selectedList = page.locator('.tag-selector-list.selected-tags');
		const mainList = page.locator('.tag-selector-container .tag-selector-list:not(.selected-tags)');

		await expect(selectedList.getByRole('button', { name: 'Tag 005', exact: true })).toBeVisible();
		await expect(mainList.getByRole('button', { name: 'Tag 005', exact: true })).toHaveCount(0);

		// Clicking the selected tag deselects it; the selected row disappears and the tag is back in
		// the main list.
		await selectedList.getByRole('button', { name: 'Tag 005', exact: true }).click();
		await expect(page.locator('.tag-selector-list.selected-tags')).toHaveCount(0);
		await expect(mainList.getByRole('button', { name: 'Tag 005', exact: true })).toBeVisible();
	});

	test('Keyboard focus follows a tag selected with the keyboard and crosses between the rows', async ({ page, serverPort }) => {
		const { handlers, patchState } = withGeneratedTags(10);
		server = await loadFixtureAtPath('desktop-test-user-library-view', 'testuser', serverPort, page, handlers, { patchState });

		const selectedList = page.locator('.tag-selector-list.selected-tags');
		const mainList = page.locator('.tag-selector-container .tag-selector-list:not(.selected-tags)');

		// Focus a tag in the main list and select it with the keyboard.
		await mainList.getByRole('button', { name: 'Tag 003', exact: true }).focus();
		await page.keyboard.press('Enter');

		// Focus follows the tag into the selected row.
		const selectedTag = selectedList.getByRole('button', { name: 'Tag 003', exact: true });
		await expect(selectedTag).toBeFocused();
		await expect(mainList.getByRole('button', { name: 'Tag 000', exact: true })).toBeVisible();

		// Arrow navigation crosses from the selected row into the main list and back.
		await page.keyboard.press('ArrowDown');
		await expect(mainList.getByRole('button', { name: 'Tag 000', exact: true })).toBeFocused();
		await page.keyboard.press('ArrowUp');
		await expect(selectedTag).toBeFocused();
	});
});

test.describe('Desktop Tag Selector -- dropping items onto a tag', () => {
	let server;

	// Items at index 61 and beyond are not in the fixture state. With more than one key in the URL the
	// library does not fetch the selected items, so the second one stays unfetched.
	const [unfetchedItem] = generateTestItems(1, { keyPrefix: 'UNFCH', titlePrefix: 'Unfetched Item', startIndex: 70 });
	const path = `testuser/items/C74GF3H6,${unfetchedItem.key}`;

	// Serves `/items?itemKey=` from `availableItems` and accepts every multi-item write
	const makeItemsHandler = (availableItems, { fetchedKeys, writes }) => (req, resp) => {
		const url = new URL(req.url, 'http://localhost');
		if (url.pathname !== '/api/users/1/items') {
			return false;
		}
		resp.setHeader('Content-Type', 'application/json');
		resp.setHeader('Last-Modified-Version', '1000001');
		if (req.method === 'POST') {
			let body = '';
			req.on('data', chunk => body += chunk);
			req.on('end', () => {
				const multiPatch = JSON.parse(body);
				writes.push(multiPatch);
				resp.end(JSON.stringify({
					successful: Object.fromEntries(multiPatch.map((patch, index) => [index, { key: patch.key, data: patch }])),
					success: Object.fromEntries(multiPatch.map((patch, index) => [index, patch.key])),
					unchanged: {},
					failed: {},
				}));
			});
			return true;
		}
		const itemKeys = url.searchParams.get('itemKey')?.split(',') ?? [];
		fetchedKeys.push(...itemKeys);
		const items = availableItems.filter(item => itemKeys.includes(item.key));
		resp.setHeader('Total-Results', String(items.length));
		resp.end(JSON.stringify(items));
		return true;
	};

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('Dropping a selection that includes an unfetched item tags every selected item', async ({ page, serverPort }) => {
		const fetchedKeys = [];
		const writes = [];
		const { handlers, patchState } = withGeneratedTags(10);
		const itemsHandler = makeItemsHandler([unfetchedItem], { fetchedKeys, writes });
		server = await loadFixtureAtPath('desktop-test-user-library-view', path, serverPort, page, [itemsHandler, ...handlers], { patchState });

		const firstRow = page.locator('.items-table [role="row"][data-index="0"]');
		await expect(firstRow).toHaveAttribute('aria-selected', 'true');
		await expect(page.getByText('2 items selected')).toBeVisible();
		expect(fetchedKeys).not.toContain(unfetchedItem.key);

		const mainList = page.locator('.tag-selector-container .tag-selector-list:not(.selected-tags)');
		await firstRow.dragTo(mainList.getByRole('button', { name: 'Tag 003', exact: true }));

		await expect.poll(() => writes.length).toBe(1);
		expect(fetchedKeys).toContain(unfetchedItem.key);
		expect(writes[0]).toEqual([
			{ key: 'C74GF3H6', tags: [{ tag: 'Tag 003' }] },
			{ key: unfetchedItem.key, tags: [{ tag: 'Tag 003' }] },
		]);
	});

	test('A selected item that cannot be fetched fails the tag write without blocking later writes', async ({ page, serverPort }) => {
		const fetchedKeys = [];
		const writes = [];
		const { handlers, patchState } = withGeneratedTags(10);
		const itemsHandler = makeItemsHandler([], { fetchedKeys, writes });
		server = await loadFixtureAtPath('desktop-test-user-library-view', path, serverPort, page, [itemsHandler, ...handlers], { patchState });

		const firstRow = page.locator('.items-table [role="row"][data-index="0"]');
		await expect(page.getByText('2 items selected')).toBeVisible();

		const mainList = page.locator('.tag-selector-container .tag-selector-list:not(.selected-tags)');
		await firstRow.dragTo(mainList.getByRole('button', { name: 'Tag 003', exact: true }));
		await expect(page.getByText('Some updates failed.')).toBeVisible();
		expect(fetchedKeys).toContain(unfetchedItem.key);

		await firstRow.click();
		await expect(page.getByText('2 items selected')).toHaveCount(0);
		await firstRow.dragTo(mainList.getByRole('button', { name: 'Tag 004', exact: true }));

		await expect.poll(() => writes.length).toBe(1);
		expect(writes[0]).toEqual([{ key: 'C74GF3H6', tags: [{ tag: 'Tag 004' }] }]);
	});
});

import { closeServer, getServer, loadFixtureState, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { getMenuEntries, isSingleColumn, waitForLoad } from '../utils/common.js';
import itemsInCollectionAlgorithms from '../fixtures/response/test-user-get-items-in-collection-algorithms.json' with { type: 'json' };

const ITEM_KEY = '3JCLFUG4';
const ALGORITHMS_COLLECTION_KEY = 'CSB4KZUU';
const AI_COLLECTION_KEY = 'I6WUED2Y';
const TRASHED_ITEM_KEY = 'BPM2IS2N';
const STANDALONE_PDF_KEY = 'UMPPCXU4';

const readOnly = {
	patchState: state => {
		state.config.libraries[0].isReadOnly = true;
		return state;
	}
};

// Fulfils items writes as successful and records the posted patches. Matched by pathname, as the
// request URL carries a query string.
const routeItemsWrite = async page => {
	const writes = [];
	await page.route(url => url.pathname === '/api/users/1/items', route => {
		if(route.request().method() !== 'POST') {
			return route.fallback();
		}
		const patches = route.request().postDataJSON();
		writes.push(patches);
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			headers: { 'Last-Modified-Version': '1' },
			body: JSON.stringify({
				success: Object.fromEntries(patches.map((patch, index) => [index, patch.key])),
				successful: Object.fromEntries(patches.map((patch, index) => [index, { key: patch.key, version: 1, data: patch }])),
				unchanged: {},
				failed: {},
			}),
		});
	});
	return writes;
};

const openItemOptions = async page => {
	const toggle = page.getByRole('button', { name: 'Item Options' });
	await expect(toggle).toBeVisible();
	await toggle.tap();
	const menu = page.getByRole('menu');
	await expect(menu).toBeVisible();
	return menu;
};

test.describe('Item Options in item details', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('offers actions for the item shown next to the Edit button', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page);

		const toggle = page.getByRole('button', { name: 'Item Options' });
		await expect(toggle).toBeVisible();
		const toolbar = page.getByRole('toolbar').filter({ has: toggle });
		await expect(toolbar.getByRole('button', { name: 'Edit' })).toBeVisible();

		const menu = await openItemOptions(page);
		await expect.poll(() => getMenuEntries(menu)).toEqual([
			'Add To Collection', 'Remove From Collection', 'Move To Trash', '-',
			'Create Citation', 'Export', '-',
			'View PDF', '-',
			'Duplicate Item',
		]);
		await expect(menu.getByRole('menuitem', { name: 'Create Bibliography' })).toHaveCount(0);
	});

	test('Create Citation opens the citation modal for the item shown', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page);

		const menu = await openItemOptions(page);
		await menu.getByRole('menuitem', { name: 'Create Citation' }).tap();

		const modal = page.getByRole('dialog', { name: 'Copy Citation' });
		await expect(modal).toBeVisible();
		await expect(modal.locator('.citation-touch')).toHaveCount(1);
		await expect(modal.locator(`.citation-touch[data-key="${ITEM_KEY}"]`)).toBeVisible();
	});

	test('Add To Collection adds the item shown to the picked collection', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler('/api/users/1/settings/tagColors', { value: [] }),
		];
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page, handlers);

		const menu = await openItemOptions(page);
		await menu.getByRole('menuitem', { name: 'Add To Collection' }).tap();

		const modal = page.getByRole('dialog', { name: 'Select Collection' });
		await expect(modal).toBeVisible();
		await page.waitForFunction(() =>
			document.querySelector('.collection-select-modal')?.classList.contains('ReactModal__Content--after-open')
		);

		await modal.getByRole('treeitem', { name: 'My Library' }).tap();
		const ai = modal.getByRole('treeitem', { name: 'AI' });
		await expect(ai).toBeVisible();
		await ai.getByRole('checkbox').tap();

		const writes = await routeItemsWrite(page);
		await modal.getByRole('button', { name: 'Add' }).tap();

		await expect.poll(() => writes).toHaveLength(1);
		const [patches] = writes;
		expect(patches).toHaveLength(1);
		expect(patches[0].key).toBe(ITEM_KEY);
		expect(patches[0].collections).toEqual(expect.arrayContaining([ALGORITHMS_COLLECTION_KEY, AI_COLLECTION_KEY]));
		expect(patches[0].collections).toHaveLength(2);
		await expect(modal).not.toBeVisible();
		await expect(page.locator('.message.error')).toHaveCount(0);
	});

	test('Move To Trash trashes the item shown and returns to the item list', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page);

		const writes = await routeItemsWrite(page);

		const menu = await openItemOptions(page);
		await menu.getByRole('menuitem', { name: 'Move To Trash' }).tap();

		await expect.poll(() => writes).toEqual([[{ key: ITEM_KEY, deleted: 1 }]]);
		await expect(page).toHaveURL(new RegExp(`/collections/${ALGORITHMS_COLLECTION_KEY}/item-list$`));
		await expect(page.getByRole('heading', { name: 'Cooperative pathfinding' })).not.toBeVisible();
		await expect(page.getByRole('button', { name: 'Item Options' })).not.toBeVisible();
		await expect(page.locator('.message.error')).toHaveCount(0);
	});

	test('offers only read actions in a read-only library', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page, [], readOnly);

		const toggle = page.getByRole('button', { name: 'Item Options' });
		await expect(toggle).toBeVisible();
		await expect(page.getByRole('button', { name: 'Edit' })).not.toBeVisible();

		const menu = await openItemOptions(page);
		await expect.poll(() => getMenuEntries(menu)).toEqual(['Create Citation', 'Export', '-', 'View PDF']);
	});

	test('separates the viewing and parent actions of a standalone PDF', async ({ page, serverPort }) => {
		server = await getServer('mobile-test-user-item-details-view', serverPort);
		await page.goto(`http://localhost:${serverPort}/testuser/collections/${ALGORITHMS_COLLECTION_KEY}/items/${STANDALONE_PDF_KEY}/item-details`);
		await waitForLoad(page);

		const menu = await openItemOptions(page);
		await expect.poll(() => getMenuEntries(menu)).toEqual([
			'Add To Collection', 'Remove From Collection', 'Move To Trash', '-',
			'Create Citation', 'Export', '-',
			'View PDF', '-',
			'Retrieve Metadata', 'Create Parent Item', 'Change Parent Item',
		]);
	});

	test('offers restoring and deleting in the trash', async ({ page, serverPort }) => {
		const handlers = [
			makeCustomHandler(`/api/users/1/items/${TRASHED_ITEM_KEY}/children`, []),
		];
		server = await getServer('mobile-test-user-trash-collection-details-view', serverPort, handlers);
		await page.goto(`http://localhost:${serverPort}/testuser/trash/items/${TRASHED_ITEM_KEY}/item-details`);
		await waitForLoad(page);

		const menu = await openItemOptions(page);
		await expect.poll(() => getMenuEntries(menu)).toEqual([
			'Restore to Library', 'Delete Permanently', '-',
			'Create Citation', 'Export',
		]);

		const writes = await routeItemsWrite(page);
		await menu.getByRole('menuitem', { name: 'Restore to Library' }).tap();

		await expect.poll(() => writes).toEqual([[{ key: TRASHED_ITEM_KEY, deleted: 0 }]]);
		await expect(page).toHaveURL(/\/trash\/item-list$/);
		await expect(page.locator('.message.error')).toHaveCount(0);
	});

	test('is not offered for a collection in the trash', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-trash-collection-details-view', serverPort, page);

		if(isSingleColumn(test.info())) {
			await expect(page.getByRole('button', { name: 'Collection Trash Options' })).toBeVisible();
		} else {
			await expect(page.getByRole('button', { name: 'Restore to Library' })).toBeVisible();
		}
		await expect(page.getByRole('button', { name: 'Item Options' })).toHaveCount(0);
	});

	test('is hidden while editing', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page);

		const toggle = page.getByRole('button', { name: 'Item Options' });
		await expect(toggle).toBeVisible();

		await page.getByRole('button', { name: 'Edit' }).tap();
		await expect(page.getByRole('button', { name: 'Done' })).toBeVisible();
		await expect(toggle).not.toBeVisible();

		await page.getByRole('button', { name: 'Done' }).tap();
		await expect(toggle).toBeVisible();
	});

	test('keeps every action reachable on a short landscape phone screen', async ({ page, serverPort }) => {
		test.skip(!isSingleColumn(test.info()), 'Only phones have screens this short');
		const handlers = [
			makeCustomHandler(`/api/users/1/collections/${ALGORITHMS_COLLECTION_KEY}/items/top`, itemsInCollectionAlgorithms),
		];
		await page.setViewportSize({ width: 667, height: 375 });
		server = await loadFixtureState('desktop-test-user-top-level-attachment-view', serverPort, page, handlers);

		// A standalone PDF gets the longest menu, taller than this screen
		const menu = await openItemOptions(page);
		expect(await menu.evaluate(element => element.scrollHeight > window.innerHeight)).toBe(true);

		await menu.getByRole('menuitem', { name: 'Change Parent Item' }).tap();
		await expect(page.getByRole('dialog', { name: 'Change Parent Item' })).toBeVisible();
	});

	test('is hidden in an attachment drilldown', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page);

		const toggle = page.getByRole('button', { name: 'Item Options' });
		await expect(toggle).toBeVisible();

		await page.getByRole('listitem', { name: 'Full Text' }).tap();
		await expect(page).toHaveURL(new RegExp(`/items/${ITEM_KEY}/attachment/[A-Z0-9]{8}/item-details$`));
		await expect(toggle).not.toBeVisible();
	});
});

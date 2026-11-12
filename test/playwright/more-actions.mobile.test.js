import { loadFixtureState, closeServer, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { getMenuEntries, isSingleColumn } from '../utils/common.js';

const SECOND_NOTE_KEY = 'Z6HA62VK';

// "Dogs" has a single standalone note (Z6HA62VJ), add a clone so two notes can be selected
const patchState = state => {
	const lib = state.libraries.u1;
	const clone = { ...lib.items.Z6HA62VJ, key: SECOND_NOTE_KEY };
	lib.items[SECOND_NOTE_KEY] = clone;
	lib.dataObjects[SECOND_NOTE_KEY] = { ...clone };
	const collection = lib.itemsByCollection.WTTJ2J56;
	collection.keys = [...collection.keys, SECOND_NOTE_KEY];
	collection.totalResults += 1;
	collection.pointer += 1;
	return state;
};

const enterSelectMode = async (page, testInfo) => {
	if (isSingleColumn(testInfo)) {
		await page.locator('.item-actions-touch').first().tap();
		const selectItems = page.getByRole('menuitem', { name: 'Select Items' });
		await expect(selectItems).toBeVisible();
		await selectItems.tap();
	} else {
		const selectButton = page.getByRole('button', { name: 'Select', exact: true });
		await expect(selectButton).toBeVisible();
		await selectButton.tap();
	}
};

test.describe('Touch footer more actions', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('should enable more actions when Change Parent Item is the only action', async ({ page, serverPort }, testInfo) => {
		const handlers = [makeCustomHandler('/api/users/1/settings/tagColors', { value: [] })];
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, handlers, { patchState });
		await enterSelectMode(page, testInfo);

		await page.locator('[data-key="Z6HA62VJ"]').tap();
		await page.locator(`[data-key="${SECOND_NOTE_KEY}"]`).tap();
		await expect(page.locator('.toolbar-heading:visible', { hasText: '2 Items Selected' })).toHaveCount(1);

		const moreActions = page.locator('.touch-footer .item-actions-touch');
		await expect(moreActions).toBeEnabled();
		await moreActions.tap();

		const menu = page.getByRole('menu');
		await expect(menu).toBeVisible();
		expect(await getMenuEntries(menu)).toEqual(['Change Parent Item']);

		await menu.getByRole('menuitem', { name: 'Change Parent Item' }).tap();
		await expect(page.getByRole('dialog', { name: 'Change Parent Item' })).toBeVisible();

		await page.close();
	});
});

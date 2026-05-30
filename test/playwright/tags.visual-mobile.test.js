import { closeServer, loadFixtureState, makeCustomHandler } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { wait, isSingleColumn } from '../utils/common.js';
import collectionTags from '../fixtures/response/test-user-collection-items-tags.json' assert { type: 'json' };

test.describe('Mobile Tag Selector Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('should render tag selector list', async ({ page, serverPort }) => {
		// Populate the current collection's tag source so the tag selector list has data to
		// display. This is the list rendered inside the touch tag selector itself -- not the
		// list inside the "Manage Tags" modal (the modal tests deliberately leave this empty).
		const collectionTagsHandler = makeCustomHandler(
			'/api/users/1/collections/WTTJ2J56/items/top/tags',
			collectionTags,
			{ totalResults: collectionTags.length }
		);
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, [collectionTagsHandler]);

		if (isSingleColumn(test.info())) {
			await page.getByRole('button', { name: 'Toggle tag selector' }).tap();
		} else {
			await page.getByRole('button', { name: 'Open Tag Selector' }).tap();
		}

		// The touch tag selector slides up and renders the collection's tags in its list
		const tagSelector = page.locator('.touch-tag-selector');
		await expect(tagSelector).toBeVisible();
		const list = tagSelector.getByRole('list', { name: 'Tags' });
		await expect(list.getByRole('listitem', { name: 'Philosophy of Music' })).toBeVisible();

		await wait(500); // ensure slide-up animation has settled and icons are loaded

		// Guard against the list collapsing to zero height again (the layout bug fixed in
		// `_touch-selector.scss`). A plain toBeVisible() is not enough -- a clipped, zero-height
		// row still reports "visible" -- and the screenshot comparison is too lenient to notice
		// an empty list (maxDiffPixelRatio: 0.02), so assert the rendered list has real height.
		const listBox = await list.boundingBox();
		expect(listBox?.height ?? 0).toBeGreaterThan(100);

		await expect(page).toHaveScreenshot('mobile-tag-selector-list.png');
		await page.close();
	});
});

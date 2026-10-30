import { loadFixtureState, closeServer } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { isSingleColumn } from '../utils/common.js';

const DOGS_COLLECTION_KEY = 'WTTJ2J56';

const withDogsCollectionName = name => ({
	patchState: state => {
		state.libraries.u1.dataObjects[DOGS_COLLECTION_KEY].name = name;
		return state;
	}
});

test.describe('Mobile Interaction', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('Tapping "Libraries" in touch header navigates to root libraries view', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-library-view', serverPort, page);

		// Target the collections touch-nav (on iPad there are two: "Collections" and "Items")
		const collectionsNav = page.getByRole('navigation', { name: 'Collections' }).or(
			page.getByRole('navigation', { name: 'Main' })
		);
		await expect(collectionsNav).toBeVisible();

		// The "Libraries" label should be visible as the back/previous button
		const librariesButton = collectionsNav.locator('.previous .truncate', { hasText: 'Libraries' });
		await expect(librariesButton).toBeVisible();

		// Tap the "Libraries" back button
		await librariesButton.tap();

		// URL should now be the root path
		await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/$/);

		// Both libraries should be visible as tappable tree items in the root view
		await expect(page.getByRole('treeitem', { name: 'My Library' })).toBeVisible();
		await expect(page.getByRole('treeitem', { name: 'Animals' })).toBeVisible();
	});

	test('Scrolling collection tree closes open dot menu dropdown', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-library-view', serverPort, page);

		const aiTreeItem = page.getByRole('treeitem', { name: 'AI' });
		await expect(aiTreeItem).toBeVisible();
		const moreButton = aiTreeItem.getByTitle('More');
		await moreButton.tap({ force: true });

		const menuItem = page.getByRole('menuitem', { name: 'New Subcollection' });
		await expect(menuItem).toBeVisible();

		// Scroll the collection tree -- find and dispatch scroll on the nearest scrollable
		// ancestor of a collection node (mirrors the production code's scroll parent detection)
		await page.evaluate(() => {
			const node = document.querySelector('[data-collection-key]');
			let el = node.parentElement;
			while (el && el !== document.body) {
				const { overflow, overflowY } = getComputedStyle(el);
				if (['auto', 'scroll'].includes(overflow) || ['auto', 'scroll'].includes(overflowY)) {
					break;
				}
				el = el.parentElement;
			}
			if (el && el !== document.body) {
				el.dispatchEvent(new Event('scroll'));
			}
		});

		await expect(menuItem).not.toBeVisible();
	});

	test('Item details renders as sections without tab semantics', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-details-view', serverPort, page);
		await expect(page.getByRole('heading', { name: 'Cooperative pathfinding' })).toBeVisible();

		// The header is hidden in sections mode, so hidden elements must be included for these queries to be meaningful
		const itemDetails = page.locator('.item-details');
		await expect(itemDetails.locator('.tabs .tab').first()).toBeAttached();
		await expect(itemDetails.getByRole('tablist', { includeHidden: true })).toHaveCount(0);
		await expect(itemDetails.getByRole('tab', { includeHidden: true })).toHaveCount(0);
		await expect(itemDetails.locator('.tabs .tab[aria-controls]')).toHaveCount(0);
	});

	test('Touch header replaces a previous title that does not fit with "Back"', async ({ page, serverPort }) => {
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, [],
			withDogsCollectionName('Domesticated Dogs and Their Wild Ancestors Across Continents and Centuries')
		);

		// On phones the long collection name is the previous title. On tablets it is the current title
		// in the collections navigation, leaving no room for the previous title.
		const nav = page.getByRole('navigation', { name: 'Collections' }).or(
			page.getByRole('navigation', { name: 'Main' })
		);
		const previous = nav.locator('.previous');
		await expect(previous).toHaveClass(/collapsed/);
		await expect(previous.locator('.back-label')).toHaveCSS('opacity', '1');
		await expect(previous.locator('.label')).toHaveCSS('opacity', '0');

		await previous.locator('.back-label').tap();
		await expect(page).not.toHaveURL(/\/item-list$/);
	});

	test('Touch header shifts the current title instead of truncating titles', async ({ page, serverPort }) => {
		test.skip(!isSingleColumn(test.info()), 'Collection name is the previous title only on phones');
		server = await loadFixtureState('mobile-test-user-item-list-view', serverPort, page, [],
			withDogsCollectionName('Dogs, Wolves and Coyotes')
		);

		const nav = page.getByRole('navigation', { name: 'Main' });
		const previousLabel = nav.locator('.previous .label');
		const currentLabel = nav.locator('.current .label');
		await expect(previousLabel).toHaveText('Dogs, Wolves and Coyotes');
		await expect(currentLabel).toHaveText('Items');
		await expect(nav.locator('.previous')).not.toHaveClass(/collapsed/);

		const isTruncated = label => label.evaluate(element => element.scrollWidth > element.clientWidth);
		expect(await isTruncated(previousLabel)).toBe(false);
		expect(await isTruncated(currentLabel)).toBe(false);

		// Centered, "Items" would overlap the previous title
		const navBox = await nav.boundingBox();
		const previousBox = await previousLabel.boundingBox();
		const currentBox = await currentLabel.boundingBox();
		expect(currentBox.x).toBeGreaterThan(previousBox.x + previousBox.width);
		expect(currentBox.x + currentBox.width / 2).toBeGreaterThan(navBox.x + navBox.width / 2);
	});
});

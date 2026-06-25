import fs from 'fs/promises';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, loadFixtureState} from "../utils/fixed-state-server.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Seed localStorage with a reordered column list (plus the current app version)
// before boot, since column order comes from preferences, not the fixture state.
const seedColumnOrder = async (page, leftMostColumnName) => {
	const fixture = JSON.parse(
		await fs.readFile(join(ROOT, 'test/fixtures/state/desktop-test-user-item-view.json'), 'utf-8')
	);
	const {version} = JSON.parse(await fs.readFile(join(ROOT, 'data/version.json'), 'utf-8'));
	const columns = [...fixture.preferences.columns];
	const from = columns.findIndex(c => c.field === leftMostColumnName);
	columns.unshift(columns.splice(from, 1)[0]);
	await page.addInitScript(({columns, version}) => {
		window.localStorage.setItem('zotero-web-library-prefs', JSON.stringify({columns, version}));
	}, {columns, version});
};

const probeItemTypeIcon = page => page.evaluate(() => {
	const firstRow = document.querySelector('.items-table-body .item');
	const columnOrder = [...firstRow.querySelectorAll('.metadata')].map(m => m.dataset.columnName);
	return {
		columnOrder,
		iconInTitle: !!firstRow.querySelector('.metadata.title .item-type-icon'),
		iconInCreator: !!firstRow.querySelector('.metadata.creator .item-type-icon'),
	};
});

test.describe('Desktop Layout', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('Items container shrinks when viewport narrows within lg breakpoint', async ({ page, serverPort }) => {
		await page.setViewportSize({ width: 1300, height: 800 });
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		const itemsContainer = page.locator('.items-container');
		const itemDetails = page.locator('.item-details');

		// At 1300px (lg), both items-container and item-details should be visible
		await expect(itemsContainer).toBeVisible();
		await expect(itemDetails).toBeVisible();

		const initialWidth = await itemsContainer.evaluate(el => el.offsetWidth);

		// Shrink to 1200px (still lg)
		await page.setViewportSize({ width: 1200, height: 800 });

		// Items-container should shrink
		const shrunkWidth = await itemsContainer.evaluate(el => el.offsetWidth);
		expect(shrunkWidth).toBeLessThan(initialWidth);

		// Item details should still be fully within the viewport
		const detailsBox = await itemDetails.boundingBox();
		expect(detailsBox.x + detailsBox.width).toBeLessThanOrEqual(1200);
	});

	test('Items table column content left-aligns with header labels', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		// Ensure the body has rendered item rows before measuring
		await expect(page.locator('.items-table-body .item').first()).toBeVisible();

		const columns = await page.evaluate(() => {
			const firstRow = document.querySelector('.items-table-body .item');
			return [...document.querySelectorAll('.items-table-head .column-header')].map(headerCell => {
				const name = headerCell.dataset.columnName;
				const headerLabel = headerCell.querySelector('.header-label');
				const bodyContent = firstRow.querySelector(`.metadata[data-column-name="${name}"] .truncate`);
				return {
					name,
					headerLabelLeft: headerLabel ? headerLabel.getBoundingClientRect().left : null,
					bodyContentLeft: bodyContent ? bodyContent.getBoundingClientRect().left : null,
				};
			});
		});

		const nonTitle = columns.filter(c =>
			c.name && c.name !== 'title' && c.headerLabelLeft !== null && c.bodyContentLeft !== null
		);

		// Sanity check: we actually measured the data columns (creator, date, ...)
		expect(nonTitle.length).toBeGreaterThan(0);

		// Every non-title column's content must line up with its header label, not
		// with the column separator. Regression guard for the first-column width
		// reduction that used to shift all following columns 8px to the left.
		for (const col of nonTitle) {
			expect(
				Math.abs(col.bodyContentLeft - col.headerLabelLeft),
				`column "${col.name}" body content should align with its header label`
			).toBeLessThanOrEqual(1);
		}

		// The title column is intentionally exempt: the item type icon pushes its
		// content to the right of the header label, so it must NOT be aligned.
		const title = columns.find(c => c.name === 'title');
		expect(title.bodyContentLeft).toBeGreaterThan(title.headerLabelLeft + 1);
	});

	test('Item type icon renders in the title column when it is left-most (default order)', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);
		await expect(page.locator('.items-table-body .item').first()).toBeVisible();

		const { columnOrder, iconInTitle, iconInCreator } = await probeItemTypeIcon(page);

		// Sanity check: default order really does put title first
		expect(columnOrder[0]).toBe('title');
		expect(iconInTitle).toBe(true);
		expect(iconInCreator).toBe(false);
	});

	test('Item type icon follows the left-most column when columns are reordered', async ({ page, serverPort }) => {
		// Move the creator column ahead of the title column
		await seedColumnOrder(page, 'creator');
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);
		await expect(page.locator('.items-table-body .item').first()).toBeVisible();

		const { columnOrder, iconInTitle, iconInCreator } = await probeItemTypeIcon(page);

		// The icon is injected into whichever column is left-most, so it must move
		// to the creator column and must NOT stay with the title column.
		expect(columnOrder[0]).toBe('creator');
		expect(iconInCreator).toBe(true);
		expect(iconInTitle).toBe(false);
	});

	test('Layout switches from 3-column to 2-column when crossing lg/md breakpoint', async ({ page, serverPort }) => {
		await page.setViewportSize({ width: 1300, height: 800 });
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		const items = page.locator('section.items');
		const itemsContainer = page.locator('.items-container');
		const itemDetails = page.locator('.item-details');

		// At 1300px (lg): row layout -- items-container and item-details side by side
		let itemsDirection = await items.evaluate(el => getComputedStyle(el).flexDirection);
		expect(itemsDirection).toBe('row');

		// Shrink to 1024px (md): column layout -- items-container and item-details stacked
		await page.setViewportSize({ width: 1024, height: 800 });

		itemsDirection = await items.evaluate(el => getComputedStyle(el).flexDirection);
		expect(itemsDirection).toBe('column');

		// Both should be visible within viewport
		await expect(itemsContainer).toBeVisible();
		await expect(itemDetails).toBeVisible();

		const containerBox = await itemsContainer.boundingBox();
		const detailsBox = await itemDetails.boundingBox();

		// Item details should be below items-container (stacked layout)
		expect(detailsBox.y).toBeGreaterThanOrEqual(containerBox.y + containerBox.height - 1);

		// Item details should be within the viewport
		expect(detailsBox.y + detailsBox.height).toBeLessThanOrEqual(800);
	});
});

import fs from 'fs/promises';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import {test, expect} from "../utils/playwright-fixtures.js";
import {closeServer, loadFixtureState, makeCustomHandler} from "../utils/fixed-state-server.js";

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

// Seed localStorage with the "Stacked Layout" preference (plus the current app version) before boot
const seedStackedLayout = async page => {
	const {version} = JSON.parse(await fs.readFile(join(ROOT, 'data/version.json'), 'utf-8'));
	await page.addInitScript(({version}) => {
		window.localStorage.setItem('zotero-web-library-prefs', JSON.stringify({layout: 'stacked', version}));
	}, {version});
};

// Underscores offer no line break opportunity, so the filename can only wrap anywhere
const longFilename = 'Attention_Is_All_You_Need_Vaswani_Shazeer_Parmar_Uszkoreit_Jones_Gomez_Kaiser_Polosukhin_NeurIPS_2017.pdf';
const veryLongTitle = 'A very long attachment title that keeps going and going to describe every single detail of the document it belongs to, including the conference, the authors, the year, the edition, the chapter and a few more words for good measure so that it wraps over many lines';

const getBottom = async locator => {
	const box = await locator.boundingBox();
	return box.y + box.height;
};

const getRight = async locator => {
	const box = await locator.boundingBox();
	return box.x + box.width;
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

	test('Item details tablist spans the full width of the panel header', async ({ page, serverPort }) => {
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		const header = page.locator('.item-details .panel-header');
		const tablist = header.getByRole('tablist', { name: 'Item Details' });
		await expect(tablist).toBeVisible();

		// The tablist's bottom border is the header's divider, so it must not shrink to fit its tabs
		const headerWidth = await header.evaluate(el => el.getBoundingClientRect().width);
		const tablistWidth = await tablist.evaluate(el => el.getBoundingClientRect().width);
		expect(Math.abs(tablistWidth - headerWidth)).toBeLessThanOrEqual(1);
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

	test('Stacked Layout setting stacks item details below the items on wide screens', async ({ page, serverPort }) => {
		await page.setViewportSize({ width: 1300, height: 800 });
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page);

		const items = page.locator('section.items');
		const itemsContainer = page.locator('.items-container');
		const itemDetails = page.locator('.item-details');
		const emptyField = itemDetails.locator('.metadata-list .metadata.empty').first();
		const modal = page.getByRole('dialog', { name: 'Settings' });
		const stackedLayoutSwitch = modal.getByRole('switch', { name: 'Stacked Layout' });
		const toggleStackedLayout = async () => {
			await page.getByRole('button', { name: 'Open Settings' }).click();
			await stackedLayoutSwitch.click();
			await modal.getByRole('button', { name: 'Close Dialog' }).click();
			await expect(modal).toBeHidden();
		};

		expect(await items.evaluate(el => getComputedStyle(el).flexDirection)).toBe('row');
		await expect(emptyField).toBeVisible();

		await toggleStackedLayout();
		await expect(page.locator('html')).toHaveClass(/stacked-layout/);
		expect(await items.evaluate(el => getComputedStyle(el).flexDirection)).toBe('column');

		const containerBox = await itemsContainer.boundingBox();
		const detailsBox = await itemDetails.boundingBox();
		expect(detailsBox.y).toBeGreaterThanOrEqual(containerBox.y + containerBox.height - 1);
		expect(detailsBox.y + detailsBox.height).toBeLessThanOrEqual(800);

		// Empty fields are hidden behind a toggle, as on md screens
		await expect(emptyField).toBeHidden();
		await page.getByRole('button', { name: 'Show Empty Fields' }).click();
		await expect(emptyField).toBeVisible();

		// The navbar keeps its wide screen layout
		await expect(page.getByRole('button', { name: 'Toggle navigation' })).toBeHidden();

		await toggleStackedLayout();
		await expect(page.locator('html')).not.toHaveClass(/stacked-layout/);
		expect(await items.evaluate(el => getComputedStyle(el).flexDirection)).toBe('row');
		await expect(page.getByRole('button', { name: 'Hide Empty Fields' })).toHaveCount(0);
	});

	for (const { layout, width, isStackedLayoutPreferred } of [
		{ layout: 'md screens', width: 1150, isStackedLayoutPreferred: false },
		{ layout: 'wide screens with Stacked Layout', width: 1300, isStackedLayoutPreferred: true },
	]) {
		test(`Standalone attachment note fits the item pane on ${layout}`, async ({ page, serverPort }) => {
			await page.setViewportSize({ width, height: 800 });
			if (isStackedLayoutPreferred) {
				await seedStackedLayout(page);
			}
			server = await loadFixtureState('desktop-test-user-top-level-attachment-view', serverPort, page, [], {
				patchState: state => {
					state.libraries.u1.items[state.current.itemKey].filename = longFilename;
					state.libraries.u1.dataObjects[state.current.itemKey].filename = longFilename;
					return state;
				}
			});
			if (isStackedLayoutPreferred) {
				await expect(page.locator('html')).toHaveClass(/stacked-layout/);
			}

			const panelBody = page.locator('.item-details .panel-body');
			const metadata = page.locator('.standalone-attachment .metadata-list');
			const editor = page.locator('.standalone-attachment .rich-editor');
			const migrateButton = page.getByRole('button', { name: 'Migrate to Standalone Note' });
			await expect(migrateButton).toBeVisible();
			await expect(metadata.getByText(longFilename)).toBeVisible();

			// The item pane doesn't scroll, the note and the button below it must fit
			const panelBodyBottom = await getBottom(panelBody);
			expect(await getBottom(editor)).toBeLessThanOrEqual(panelBodyBottom);
			expect(await getBottom(migrateButton)).toBeLessThanOrEqual(panelBodyBottom);

			// The note is shown next to the attachment metadata, in columns of equal width
			const metadataBox = await metadata.boundingBox();
			const editorBox = await editor.boundingBox();
			expect(editorBox.x).toBeGreaterThanOrEqual(metadataBox.x + metadataBox.width - 1);
			expect(Math.abs(editorBox.width - metadataBox.width)).toBeLessThanOrEqual(1);
			expect(await getRight(editor)).toBeLessThanOrEqual(await getRight(panelBody) + 1);
		});
	}

	test('Child attachment note fits the item pane on md screens', async ({ page, serverPort }) => {
		await page.setViewportSize({ width: 1024, height: 768 });
		server = await loadFixtureState('desktop-test-user-attachment-in-collection-view', serverPort, page, [], {
			patchState: state => {
				const attachmentKey = state.current.attachmentKey;
				for (const objects of [state.libraries.u1.items, state.libraries.u1.dataObjects]) {
					objects[attachmentKey].note = '<p>Attachment note</p>';
					objects[attachmentKey].filename = longFilename;
				}
				return state;
			}
		});

		const panelBody = page.locator('.item-details .panel-body');
		const tabPanel = page.getByRole('tabpanel', { name: 'Attachments' });
		const migrateButton = tabPanel.getByRole('button', { name: 'Migrate to Item Note' });
		await expect(migrateButton).toBeVisible();
		await expect(tabPanel.getByText(longFilename)).toBeVisible();
		expect(await getBottom(migrateButton)).toBeLessThanOrEqual(await getBottom(panelBody));
		expect(await getRight(migrateButton)).toBeLessThanOrEqual(await getRight(panelBody) + 1);

		// The attachment list starts right below the toolbar (allowing for the permanent-scrollbar padding)
		const toolbarBottom = await getBottom(tabPanel.getByRole('toolbar'));
		const listBox = await tabPanel.getByRole('list', { name: 'Attachments' }).boundingBox();
		expect(listBox.y - toolbarBottom).toBeGreaterThanOrEqual(0);
		expect(listBox.y - toolbarBottom).toBeLessThanOrEqual(4);
	});

	for (const { name, fixture, getAttachmentKey, tabName, migrateLabel } of [
		{
			name: 'Standalone',
			fixture: 'desktop-test-user-top-level-attachment-view',
			getAttachmentKey: state => state.current.itemKey,
			tabName: 'Info',
			migrateLabel: 'Migrate to Standalone Note',
		},
		{
			name: 'Child',
			fixture: 'desktop-test-user-attachment-in-collection-view',
			getAttachmentKey: state => state.current.attachmentKey,
			tabName: 'Attachments',
			migrateLabel: 'Migrate to Item Note',
		},
	]) {
		const loadWithVeryLongMetadata = (page, serverPort, note) => loadFixtureState(fixture, serverPort, page, [], {
			patchState: state => {
				const attachmentKey = getAttachmentKey(state);
				for (const objects of [state.libraries.u1.items, state.libraries.u1.dataObjects]) {
					objects[attachmentKey].title = veryLongTitle;
					objects[attachmentKey].filename = longFilename;
					objects[attachmentKey].note = note;
				}
				return state;
			}
		});

		test(`${name} attachment metadata taller than the item pane scrolls on md screens`, async ({ page, serverPort }) => {
			await page.setViewportSize({ width: 1024, height: 768 });
			server = await loadWithVeryLongMetadata(page, serverPort, '<p>Attachment note</p>');

			const panelBodyBottom = await getBottom(page.locator('.item-details .panel-body'));
			const tabPanel = page.getByRole('tabpanel', { name: tabName });
			const metadata = tabPanel.locator('.metadata-list');
			const migrateButton = tabPanel.getByRole('button', { name: migrateLabel });
			await expect(migrateButton).toBeVisible();

			// Scrolled with the mouse wheel, as clipped (overflow: hidden) content can still be scrolled from a script
			await metadata.hover();
			await page.mouse.wheel(0, 200);
			await expect.poll(() => metadata.evaluate(el => el.scrollTop)).toBeGreaterThan(0);

			// The buttons and the note editor stay in the pane while the metadata scrolls
			expect(await getBottom(tabPanel.locator('.download-options'))).toBeLessThanOrEqual(panelBodyBottom);
			expect(await getBottom(migrateButton)).toBeLessThanOrEqual(panelBodyBottom);
			expect((await tabPanel.locator('.rich-editor').boundingBox()).height).toBeGreaterThan(50);
		});

		test(`${name} attachment metadata without a note is not limited to half the item pane on md screens`, async ({ page, serverPort }) => {
			await page.setViewportSize({ width: 1024, height: 768 });
			server = await loadWithVeryLongMetadata(page, serverPort, '');

			const panelBodyBox = await page.locator('.item-details .panel-body').boundingBox();
			const tabPanel = page.getByRole('tabpanel', { name: tabName });
			await expect(tabPanel.locator('.metadata-list')).toBeVisible();
			await expect(tabPanel.locator('.rich-editor')).toHaveCount(0);

			expect((await tabPanel.locator('.metadata-list').boundingBox()).height).toBeGreaterThan(panelBodyBox.height / 2);
			expect(await getBottom(tabPanel.locator('.download-options'))).toBeLessThanOrEqual(panelBodyBox.y + panelBodyBox.height);
		});
	}

	test('Notes and Attachments toolbars span the item pane on md screens when there are no child items', async ({ page, serverPort }) => {
		await page.setViewportSize({ width: 1150, height: 800 });
		server = await loadFixtureState('desktop-test-user-item-view', serverPort, page, [
			makeCustomHandler('/api/', [], { totalResults: 0 })
		]);

		const panelBodyWidth = (await page.locator('.item-details .panel-body').boundingBox()).width;

		for (const [tabName, counter] of [['Notes', '0 notes'], ['Attachments', '0 attachments']]) {
			await page.getByRole('tab', { name: tabName }).click();
			const toolbar = page.getByRole('tabpanel', { name: tabName }).getByRole('toolbar');
			await expect(toolbar).toContainText(counter);
			const toolbarWidth = (await toolbar.boundingBox()).width;
			expect(Math.abs(toolbarWidth - panelBodyWidth), `${tabName} toolbar should span the item pane`).toBeLessThanOrEqual(1);
		}
	});
});

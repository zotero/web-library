import { getServer, closeServer } from '../utils/fixed-state-server.js';
import { getMenuEntries, waitForLoad } from '../utils/common.js';
import { test, expect } from '../utils/playwright-fixtures.js';

const NOTE_KEY = 'NOTE0001';

// "Algorithms" has no standalone note, add one cloned from child note GNVWD3U4
const patchState = state => {
	const lib = state.libraries.u1;
	const { parentItem: _parentItem, ...note } = lib.items.GNVWD3U4; // eslint-disable-line no-unused-vars
	const standaloneNote = { ...note, key: NOTE_KEY, collections: ['CSB4KZUU'] };
	lib.items[NOTE_KEY] = standaloneNote;
	lib.dataObjects[NOTE_KEY] = { ...standaloneNote };
	const collection = lib.itemsByCollection.CSB4KZUU;
	collection.keys = [...collection.keys, NOTE_KEY];
	collection.totalResults += 1;
	return state;
};

test.describe('Desktop more actions', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	const cases = [
		['a standalone note and a standalone PDF', `${NOTE_KEY},UMPPCXU4`, ['Change Parent Item', '-', 'Subscribe To Feed']],
		['a standalone note', NOTE_KEY, ['Duplicate Item', '-', 'Change Parent Item', '-', 'Subscribe To Feed']],
		['a standalone PDF', 'UMPPCXU4', ['View PDF', '-', 'Create Parent Item', 'Change Parent Item', '-', 'Subscribe To Feed']],
	];

	for (const [label, itemKeys, expected] of cases) {
		test(`should separate action groups with dividers for ${label}`, async ({ page, serverPort }) => {
			server = await getServer('desktop-test-user-note-view', serverPort, [], { patchState });
			await page.goto(`http://localhost:${serverPort}/testuser/collections/CSB4KZUU/items/${itemKeys}`);
			await waitForLoad(page);

			await page.getByRole('toolbar', { name: 'items toolbar' }).getByRole('button', { name: 'More' }).click();
			const menu = page.getByRole('menu');
			await expect(menu.getByRole('menuitem', { name: 'Subscribe To Feed' })).toBeVisible();
			expect(await getMenuEntries(menu)).toEqual(expected);

			await page.close();
		});
	}
});

import { closeServer, getServer } from '../utils/fixed-state-server.js';
import { test, expect } from '../utils/playwright-fixtures.js';
import { isSingleColumn, wait, waitForLoad } from '../utils/common.js';

const AI_COLLECTION_KEY = 'I6WUED2Y';

// Each name is too wide to be centered in the navigation, but narrow enough to fit when shifted
const LONG_COLLECTION_NAMES = {
	'Visual Mobile iPhone': 'Machine Learning Notes',
	'Visual Mobile Android': 'Machine Learning Notes',
	'Visual Mobile iPad': 'Artificial Intelligence and Neural Networks',
	'Visual Mobile iPad Dark': 'Artificial Intelligence and Neural Networks',
	'Visual Mobile iPad Pro Landscape': 'Artificial Intelligence, Machine Learning, Deep Neural Networks and Natural Language Processing',
};

test.describe('Mobile Touch Header Snapshots', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('should shift a long collection name to fit it without truncation', async ({ page, serverPort }) => {
		const name = LONG_COLLECTION_NAMES[test.info().project.name];
		server = await getServer('mobile-test-user-library-view', serverPort, [], {
			patchState: state => {
				state.libraries.u1.dataObjects[AI_COLLECTION_KEY].name = name;
				return state;
			}
		});
		await page.goto(`http://localhost:${serverPort}/testuser/collections/${AI_COLLECTION_KEY}/library`);
		await waitForLoad(page);

		// On phones the collection name is the current title next to "My Library", on tablets it is
		// the title above the items list
		const isPhone = isSingleColumn(test.info());
		const nav = page.getByRole('navigation', { name: isPhone ? 'Main' : 'Items' });
		const title = nav.locator('.current').getByText(name, { exact: true });
		await expect(title).toBeVisible();

		// Guard what the snapshot is meant to show, so that it cannot be regenerated into a centered
		// or truncated title unnoticed
		expect(await title.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(false);
		const navBox = await nav.boundingBox();
		const titleBox = await title.boundingBox();
		expect(titleBox.width).toBeGreaterThan(navBox.width / 3);
		const shift = titleBox.x + titleBox.width / 2 - (navBox.x + navBox.width / 2);
		if (isPhone) {
			// Shifted right, clear of the previous title which is shown in full
			await expect(nav.locator('.previous')).not.toHaveClass(/collapsed/);
			expect(shift).toBeGreaterThan(4);
		} else {
			// Shifted left, clear of the buttons on the right
			expect(shift).toBeLessThan(-4);
		}

		await wait(500); // avoid flaky screenshot with missing icons
		await expect(page.locator('.touch-header').filter({ has: nav }))
			.toHaveScreenshot('mobile-touch-header-long-collection-name.png');
		await page.close();
	});
});

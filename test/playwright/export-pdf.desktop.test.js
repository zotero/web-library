import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { test, expect } from '../utils/playwright-fixtures.js';
import { closeServer, loadFixtureState, makeCustomHandler, makeTextHandler } from '../utils/fixed-state-server.js';
import annotations from '../fixtures/response/test-user-export-pdf-annotations.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
// 14 pages, enough for every pageIndex in the annotations fixture
const PDF_PATH = join(ROOT, 'modules/pdf-worker/test/fixtures/pdf/full/1.pdf');
const EMPTY_RECTS_KEY = 'S8QRVQLS';

const makePDFHandler = (url, buf) => (req, resp) => {
	if (!req.url.startsWith(url)) {
		return false;
	}
	resp.statusCode = 200;
	resp.setHeader('Content-Type', 'application/pdf');
	resp.end(buf);
	return true;
};

test.describe('Export PDF with annotations', () => {
	let server;

	test.afterEach(async () => {
		await closeServer(server);
	});

	test('Exports the remaining annotations when one highlight has no rects', async ({ page, serverPort }) => {
		const pdf = await fs.readFile(PDF_PATH);
		const handlers = [
			makeTextHandler('/api/users/1/items/K24TUDDL/file/view/url', `http://localhost:${serverPort}/_pdf/export.pdf`),
			makeCustomHandler('/api/users/1/items/K24TUDDL/children', annotations),
			makePDFHandler('/_pdf/export.pdf', pdf),
			makeCustomHandler('/api/', [], { totalResults: 0 }),
		];
		server = await loadFixtureState('desktop-test-user-pdf-attachment-view-in-collection-view', serverPort, page, handlers);

		await page.getByRole('button', { name: 'Download Options' }).click();
		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('listitem', { name: 'Download', exact: true }).click();
		const download = await downloadPromise;

		expect(download.suggestedFilename()).toBe('Silver - 2005 - Cooperative pathfinding.pdf');
		// the PDF writer wraps long lines, possibly mid-token
		const exported = (await fs.readFile(await download.path())).toString('latin1').replace(/[\r\n]/g, '');
		for (const { key } of annotations) {
			expect(exported.includes(`/Zotero:Key(${key})`), key).toBe(key !== EMPTY_RECTS_KEY);
		}
	});
});

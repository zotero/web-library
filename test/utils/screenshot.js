import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pixelmatch from 'pixelmatch';
import pngjs from 'pngjs';

const PNG = pngjs.PNG;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const isUpdatingScreensots = !!process.env.UPDATE_SCREENSHOTS;

export async function screenshot(page, name, { maxDiffPixels = 0, threshold = 0.1 } = {}) {
	const outputDir = join(ROOT, 'playwright', 'output');
	const snapshotsDir = join(ROOT, 'test', 'snapshots');
	await fs.ensureDir(outputDir);
	await fs.ensureDir(snapshotsDir);

	const screenshotPath = join(ROOT, 'playwright', 'output', `${name}.png`);
	const expectedPath = join(ROOT, 'test', 'snapshots', `${name}.png`);
	await page.screenshot({ path: screenshotPath });

	if (isUpdatingScreensots) {
		fs.rename(screenshotPath, expectedPath);
		return true;
	}
	let expected;

	try {
		expected = PNG.sync.read(await fs.readFile(expectedPath));
	} catch (e) {
		console.error(`Snapshot not found for ${name}: ${e}`);
		await fs.rename(screenshotPath, expectedPath);
		return false;
	}

	const screenshot = PNG.sync.read(await fs.readFile(screenshotPath));
	const { width, height } = screenshot;
	const diff = new PNG({ width, height });

	try {
		const numDiffPixels = pixelmatch(screenshot.data, expected.data, diff.data, width, height, { threshold });
		if (numDiffPixels > 0) {
			console.log(`Found ${numDiffPixels} different pixels in ${name}`);
			await fs.writeFile(join(ROOT, 'playwright', 'output', `${name}-diff.png`), PNG.sync.write(diff));
		}
		return numDiffPixels <= maxDiffPixels;
	} catch (e) {
		console.error(`Failed to compare screenshots for ${name}: ${e}`);
		return false;
	}
}

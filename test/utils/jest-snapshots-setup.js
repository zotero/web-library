import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

(async () => {
	const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
	const { version } = JSON.parse(await fs.readFile(join(ROOT, 'node_modules', 'playwright', 'package.json'), 'utf-8'));
	global.clientPlaywrightVersion = version;
})();


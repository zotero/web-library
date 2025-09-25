/* eslint-env node */
import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fonts = [
    'https://www.zotero.org/static/web-library/fonts/36AC02_5_0.eot',
    'https://www.zotero.org/static/web-library/fonts/36AC02_5_0.woff',
    'https://www.zotero.org/static/web-library/fonts/36AC02_5_0.woff2',
    'https://www.zotero.org/static/web-library/fonts/36AC02_5_0.ttf',
    'https://www.zotero.org/static/web-library/fonts/36AC02_5_0.svg',
];

let count = 0;
const targetDir = path.join(__dirname, '..', 'src', 'static', 'fonts');
await fs.ensureDir(targetDir);

await Promise.all(
    fonts.map(async (url) => {
        const filename = path.basename(url);
        const filePath = path.join(targetDir, filename);
        try {
            await fs.access(filePath);
    } catch {
            count++;
            console.log(`Downloading ${url}`);
            const res = await fetch(url);
            const dest = fs.createWriteStream(filePath);
            res.body.pipe(dest);
        }
    })
);
if (count > 0) {
    console.log(`Downloaded ${count} fonts to ${targetDir}`);
}

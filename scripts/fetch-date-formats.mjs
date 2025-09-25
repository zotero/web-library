import fetch from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dateFormatsURL = 'https://raw.githubusercontent.com/zotero/utilities/master/resource/dateFormats.json';
const localeCacheTime = process.env.LOCALE_CACHE_TIME ?? 86400000; // 24h default
const dateFormatsPath = path.join(__dirname, '..', 'data', 'date-formats.json');

let dateFormatsJSON;
try {
    dateFormatsJSON = await fs.readJson(dateFormatsPath);
    const stat = await fs.stat(dateFormatsPath);
    if (new Date() - new Date(stat.mtime) > localeCacheTime) {
        throw new Error('Cache expired');
    }
} catch {
    console.log(`Downloading ${dateFormatsURL}`);
    dateFormatsJSON = await (await fetch(dateFormatsURL)).json();
    await fs.outputJson(dateFormatsPath, dateFormatsJSON);
}

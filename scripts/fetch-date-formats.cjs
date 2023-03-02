const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');

const dateFormatsURL = 'https://raw.githubusercontent.com/zotero/utilities/master/resource/dateFormats.json';
const localeCacheTime = process.env.LOCALE_CACHE_TIME ?? 86400000;

(async () => {
	const dateFormatsPath = path.join(__dirname, '..', 'data', 'date-formats.json');
	var dateFormatsJSON;
	try {
		dateFormatsJSON = await fs.readJson(dateFormatsPath);
		var stat = await fs.stat(dateFormatsPath);
		if(new Date() - new Date(stat.mtime) > localeCacheTime) {
			throw new Error();
		}
	} catch(e) {
		console.log(`Downloading ${dateFormatsURL}`);
		dateFormatsJSON = await (await fetch(dateFormatsURL)).json()
        await fs.outputJson(dateFormatsPath, dateFormatsJSON);
	}
})();

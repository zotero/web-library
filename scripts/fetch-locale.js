'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fetch = require('isomorphic-fetch');
const fs = require('fs-extra');
const path = require('path');

const localeURL = 'https://raw.githubusercontent.com/citation-style-language/locales/master/locales.json';
const localeCacheTime = argv['localeCacheTime'] || 0;

(async () => {
	const localeJsonPath = path.join(__dirname, '..', 'data', 'locale-data.json');
	var locale;
	try {
		locale = await fs.readJson(localeJsonPath);
		var stat = await fs.stat(localeJsonPath);
		if(new Date() - new Date(stat.mtime) > localeCacheTime) {
			throw new Error();
		}
	} catch(e) {
		console.log(`Downloading ${localeURL}`);
		locale = await (await fetch(localeURL)).json();
		const languageNames = Object.entries(locale['language-names'])
			.reduce((aggr, [key, names]) => {
				const value = key;
				const label = names[1]; // names[1] for english, names[0] for native
				aggr.push({ value, label });
				return aggr;
			}, []);

		// npm install full-icu --save-dev
		// languageNames.sort(({ label: l1 }, { label: l2 }) => l1.localeCompare(l2));
		languageNames.sort(({ label: l1 }, { label: l2 }) => l1 < l2 ? -1 : l1 > l2);
		await fs.outputJson(localeJsonPath, languageNames);
	}
})();

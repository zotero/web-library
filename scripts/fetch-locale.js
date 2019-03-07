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
				aggr[key] = names[1];
				return aggr;
			}, {});
		await fs.outputJson(localeJsonPath, languageNames);
	}
})();

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fetch = require('isomorphic-fetch');
const fs = require('fs-extra');
const path = require('path');

const stylesURL = 'https://www.zotero.org/styles-files/styles.json';
const stylesCacheTime = argv['stylesCacheTime'] || 0;

const styles = [
	'apa',
	'chicago-note-bibliography',
	'modern-language-association',
	'turabian-fullnote-bibliography'
];
const defaultStyle = 'modern-language-association';

(async () => {
	const stylesJsonPath = path.join(__dirname, '..', 'data', 'styles.json');
	const coreStylesPath = path.join(__dirname, '..', 'data', 'citation-styles-data.json');
	var stylesMeta;
	try {
		stylesMeta = await fs.readJson(stylesJsonPath);
		var stat = await fs.stat(stylesJsonPath);
		if(new Date() - new Date(stat.mtime) > stylesCacheTime) {
			throw new Error();
		}
	} catch(e) {
		console.log(`Downloading ${stylesURL}`);
		stylesMeta = await (await fetch(stylesURL)).json();
		await fs.outputJson(stylesJsonPath, stylesMeta);
	}
	const coreCitationStyles = styles.map(style => {
		const styleMeta = stylesMeta.find(sm => sm.name === style);
		if(!styleMeta) {
			console.warn(`Could not find name for style ${style}`);
			return;
		}
		return {
			isDefault: style === defaultStyle,
			name: style,
			title: styleMeta.title,
		};
	}).filter(Boolean);
	const citationStylesCount = stylesMeta.length;
	const output = {
		coreCitationStyles,
		citationStylesCount
	};
	await fs.outputJson(coreStylesPath, output);
	console.log('citation-styles-data.json has been generated');
})();

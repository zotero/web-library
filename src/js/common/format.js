import { unescapeHTML } from '../utils';
import { getItemTitle } from './item';

const entityToChar = str => {
	const textarea = document.createElement('textarea');
	textarea.innerHTML = str;
	return textarea.value;
};


// Summary of the note content for 2-line preview in the side pane
const noteSummary = note => {
	return entityToChar( // replace entities (e.g. &nbsp; or &#NNN) to unicode char
		note
			.replace(/<\s*\/?br\s*[/]?>/gi, ' ') // replace <br /> to spaces
			.replace(/<(?:.|\n)*?>/gm, '') // remove html tags. This is still going to be sanitized by React.
	).replace(/[\u202F\u00A0]/g, ' ') // replace no-break spaces to normal spaces
		.replace(/ +/g, " ") // remove series of spaces with just one
		.substring(0, 180); // truncate to 180 chars
};

const creator = creator => 'lastName' in creator ?
	[creator.lastName, creator.firstName].filter(s => s.trim().length).join(', ') : creator.name;

const dateLocalized = date => (date instanceof Date && !isNaN(date)) ?
	date.toLocaleString(navigator.language || navigator.userLanguage) : '';

//@TODO: figure out better place for this
const itemsSourceLabel = itemsSource => {
	switch (itemsSource) {
		case 'trash':
			return "Trash";
		case 'publications':
			return "My Publications";
		case 'query':
			return "Search Results";
		case 'top':
			return "All Items";
		default:
			return "Items";
	}
}

//@TODO: placeholder, to be replaced with i18n solution
const pluralize = (word, count) => count === 1 ? word : `${word}s`;


//@NOTE: should only be used for trusted/sanitized input
const stripTagsUsingDOM = html => {
	const tmp = document.createElement("DIV");
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}

const lpad = (string, pad, length) => {
	string = string ? string + '' : '';
	while (string.length < length) {
		string = pad + string;
	}
	return string;
}

// returns YYYY-MM-DD
const formatDate = date =>
	[lpad(date.getFullYear(), '0', 4), lpad(date.getMonth() + 1, '0', 2), lpad(date.getDate(), '0', 2)].join('-')

// returns YYYY-MM-DD hh:mm:dd
const formatDateTime = date =>
	formatDate(date) + " " + [lpad(date.getHours(), '0', 2), lpad(date.getMinutes(), '0', 2), lpad(date.getSeconds(), '0', 2)].join(':')



const parseDescriptiveString = str => {
	var lc = str.toLowerCase().trim();
	switch (lc) {
		case 'yesterday':
			return formatDate(new Date(new Date().getTime() - 86400000));
		case 'today':
			return formatDate(new Date());
		case 'tomorrow':
			return formatDate(new Date(new Date().getTime() + 86400000));
		case 'now':
			return formatDateTime(new Date());
	}
	return str;
}

// Adapted from:
// https://github.com/zotero/zotero/blob/04496fadcd73ad7db85d7a9c662fcbffac80d72e/chrome/content/zotero/itemTree.jsx#L2570-L2658
const titleMarkup = new Map([
	['<i>', {
		beginsTag: 'i',
		inverseStyle: { fontStyle: 'normal' }
	}],
	['</i>', {
		endsTag: 'i'
	}],
	['<b>', {
		beginsTag: 'b',
		inverseStyle: { fontWeight: 'normal' }
	}],
	['</b>', {
		endsTag: 'b'
	}],
	['<sub>', {
		beginsTag: 'sub'
	}],
	['</sub>', {
		endsTag: 'sub'
	}],
	['<sup>', {
		beginsTag: 'sup'
	}],
	['</sup>', {
		endsTag: 'sup'
	}],
	['<span style="font-variant:small-caps;">', {
		beginsTag: 'span',
		style: { fontVariant: 'small-caps' }
	}],
	['<span class="nocase">', {
		// No effect in item tree
		beginsTag: 'span'
	}],
	['</span>', {
		endsTag: 'span'
	}]
]);

const renderItemTitle = (title, targetNode) => {
	let markupStack = [];
	let nodeStack = [targetNode];
	let textContent = '';

	for (let token of title.split(/(<[^>]+>)/)) {
		if (titleMarkup.has(token)) {
			let markup = titleMarkup.get(token);
			if (markup.beginsTag) {
				let node = document.createElement(markup.beginsTag);
				if (markup.style) {
					Object.assign(node.style, markup.style);
				}
				if (markup.inverseStyle && markupStack.some(otherMarkup => otherMarkup.beginsTag === markup.beginsTag)) {
					Object.assign(node.style, markup.inverseStyle);
				}
				markupStack.push({ ...markup, token });
				nodeStack.push(node);
				continue;
			}
			else if (markup.endsTag && markupStack.some(otherMarkup => otherMarkup.beginsTag === markup.endsTag)) {
				while (markupStack.length) {
					let discardedMarkup = markupStack.pop();
					let discardedNode = nodeStack.pop();
					if (discardedMarkup.beginsTag === markup.endsTag) {
						nodeStack[nodeStack.length - 1].append(discardedNode);
						break;
					}
					else {
						nodeStack[nodeStack.length - 1].append(discardedMarkup.token, ...discardedNode.childNodes);
					}
				}

				continue;
			}
		}

		nodeStack[nodeStack.length - 1].append(token);
		textContent += token;
	}

	while (markupStack.length) {
		let discardedMarkup = markupStack.pop();
		let discardedNode = nodeStack.pop();
		nodeStack[0].append(discardedMarkup.token, ...discardedNode.childNodes);
	}

	return textContent;
}

/**
 * Copied from https://github.com/zotero/zotero/blob/8a06edab49f07b84d07056ccd594c87920ef2c5e/chrome/content/zotero/xpcom/file.js#L1286
 * Strip potentially invalid characters
 * See http://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words
 *
 * @param	{String}	fileName
 * @param	{Boolean}	[skipXML=false]		Don't strip characters invalid in XML
 */
function getValidFileName(fileName, skipXML) {
	// TODO: use space instead, and figure out what's doing extra
	// URL encode when saving attachments that trigger this
	fileName = fileName.replace(/[\/\\\?\*:|"<>]/g, '');
	// Replace newlines and tabs (which shouldn't be in the string in the first place) with spaces
	fileName = fileName.replace(/[\r\n\t]+/g, ' ');
	// Replace various thin spaces
	fileName = fileName.replace(/[\u2000-\u200A]/g, ' ');
	// Replace zero-width spaces
	fileName = fileName.replace(/[\u200B-\u200E]/g, '');
	// Replace line and paragraph separators
	fileName = fileName.replace(/[\u2028-\u2029]/g, ' ');
	if (!skipXML) {
		// Strip characters not valid in XML, since they won't sync and they're probably unwanted
		// eslint-disable-next-line no-control-regex
		fileName = fileName.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ud800-\udfff\ufffe\uffff]/g, '');

		// Normalize to NFC
		fileName = fileName.normalize();
	}
	// Replace bidi isolation control characters
	fileName = fileName.replace(/[\u2068\u2069]/g, '');
	// Don't allow hidden files
	fileName = fileName.replace(/^\./, '');
	// Don't allow blank or illegal filenames
	if (!fileName || fileName == '.' || fileName == '..') {
		fileName = '_';
	}
	return fileName;
}

// {{ firstCreator suffix=" - " }}{{ year suffix=" - " }}{{ title truncate="100" }}
const getFileBaseNameFromItem = (item, mappings) => {
	const title = getItemTitle(mappings, item);
	const date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
		item[Symbol.for('meta')].parsedDate :
		'';
	const creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
		item[Symbol.for('meta')].creatorSummary :
		'';
	const year = date.substr(0, 4);

	return `${creator}${creator ? ' - ' : ''}${year}${year ? ' - ' : ''}${title.substring(0, 100)}`;
}

export {
    creator,
    dateLocalized,
    formatDate,
    formatDateTime,
    getFileBaseNameFromItem,
    getValidFileName,
    itemsSourceLabel,
    noteSummary,
    parseDescriptiveString,
    pluralize,
    renderItemTitle,
    stripTagsUsingDOM
};

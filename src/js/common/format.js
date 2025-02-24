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

// https://github.com/zotero/utilities/blob/e00d98d3a11f6233651a052c108117cf44873edc/utilities_item.js#L576
const noteAsTitle = text => {
	const MAX_TITLE_LENGTH = 120;
	var origText = text;
	text = text.trim();
	// Add line breaks after block elements
	text = text.replace(/(<\/(h\d|p|div)+>)/g, '$1\n');
	text = text.replace(/<br\s*\/?>/g, ' ');
	text = unescapeHTML(text);

	// If first line is just an opening HTML tag, remove it
	if (/^<[^>\n]+[^/]>\n/.test(origText)) {
		text = text.trim();
	}

	var t = text.substring(0, MAX_TITLE_LENGTH);
	var ln = t.indexOf("\n");
	if (ln > -1 && ln < MAX_TITLE_LENGTH) {
		t = t.substring(0, ln);
	}
	return t;
}

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
    itemsSourceLabel,
    noteAsTitle,
    noteSummary,
    parseDescriptiveString,
    pluralize,
    renderItemTitle,
    stripTagsUsingDOM
};

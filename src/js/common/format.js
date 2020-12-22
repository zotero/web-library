'use strict';

const entityToChar = str => {
	const textarea = document.createElement('textarea');
	textarea.innerHTML = str;
	return textarea.value;
};

const noteAsTitle = note => {
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
const itemTypeLocalized = (item, itemTypes) => {
	const { itemType } = item;
	if(itemType === 'note') { return "Note" }
	if(itemType === 'attachment') { return "Attachment" }
	return (itemTypes.find(it => it.itemType === itemType) || {}).localized || itemType;
}
const dateLocalized = date => (date instanceof Date && !isNaN(date)) ?
	date.toLocaleString(navigator.language || navigator.userLanguage) : '';

//@TODO: figure out better place for this
const itemsSourceLabel = itemsSource => {
	switch(itemsSource) {
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

const formatCreator = creator => {
	return creator.name || (creator.firstName + ' ' + creator.lastName).trim();
}

const lpad = (string, pad, length) => {
	string = string ? string + '' : '';
	while(string.length < length) {
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
	switch(lc) {
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

export {
	creator,
	dateLocalized,
	formatDate,
	formatDateTime,
	itemsSourceLabel,
	itemTypeLocalized,
	noteAsTitle,
	parseDescriptiveString,
	pluralize,
	stripTagsUsingDOM,
};

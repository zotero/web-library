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
	return (itemTypes.find(it => it.itemType === itemType) || {}).localized;
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

const formatByline = item => {
	if (!item.creators) {
		return '';
	}
	const authors = item.creators.filter(c => c.creatorType == 'author');

	if (authors.length === 1) {
		return formatCreator(authors[0]);
	} else if (authors.length === 2) {
		return authors.map(c => formatCreator(c)).join(' and ');
	} else {
		let fc = authors.map(c => formatCreator(c));
		if (authors.length === 3) {
			return `${fc[0]}, ${fc[1]}, and ${fc[2]}`;
		} else if (authors.length) {
			return `${fc[0]} et al.`;
		}
	}

	return '';
}

export {
	creator,
	dateLocalized,
	formatByline,
	itemsSourceLabel,
	itemTypeLocalized,
	noteAsTitle,
	pluralize,
	stripTagsUsingDOM,
};

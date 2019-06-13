'use strict';

const noteAsTitle = note => note.split('\n')[0].replace(/<(?:.|\n)*?>/gm, '');
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

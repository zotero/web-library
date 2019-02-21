'use strict';

const { baseMappings } = require('../constants/item');
const { noteAsTitle, itemTypeLocalized, dateLocalized } = require('./format');

const getBaseMappedValue = (item, property) => {
	const { itemType } = item;
	return itemType in baseMappings && property in baseMappings[itemType] ?
		item[baseMappings[itemType][property]] : item[property];
}

const getFormattedTableItem = (item, itemTypes, libraryTags, isSynced) => {
	const { itemType, note, publisher, publication, dateAdded, dateModified, extra } = item;
	const title = itemType === 'note' ?
		noteAsTitle(note) :
		getBaseMappedValue(item, 'title');
	const creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
		item[Symbol.for('meta')].creatorSummary :
		'';
	const date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
		item[Symbol.for('meta')].parsedDate :
		'';
	const coloredTags = item.tags
		.map(tag => libraryTags[`${tag.tag}-0`])
		.filter(tag => tag && tag.color);
	// same logic as https://github.com/zotero/zotero/blob/6abfd3b5b03969564424dc03313d63ae1de86100/chrome/content/zotero/xpcom/itemTreeView.js#L1062
	const year = date.substr(0, 4);

	return {
		coloredTags,
		creator,
		date,
		dateAdded: dateLocalized(new Date(dateAdded)),
		dateModified: dateLocalized(new Date(dateModified)),
		extra,
		itemType: itemTypeLocalized(item, itemTypes),
		key: item.key,
		publicationTitle: getBaseMappedValue(item, 'publicationTitle'),
		publisher: getBaseMappedValue(item, 'publisher'),
		title,
		year,
		isSynced,
	}
};

const getFieldDisplayValue = (item, field) => {
	switch(field) {
		case 'accessDate':
		case 'dateAdded':
		case 'dateModified':
			return dateLocalized(new Date(item[field]));
		default:
			return null
	}
}

module.exports = { getFormattedTableItem, getFieldDisplayValue };

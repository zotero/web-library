'use strict';

import baseMappings from 'zotero-base-mappings';
import paramCase from 'param-case';

import { noteAsTitle, itemTypeLocalized, dateLocalized } from './format';

const getBaseMappedValue = (item, property) => {
	const { itemType } = item;
	return itemType in baseMappings && property in baseMappings[itemType] ?
		item[baseMappings[itemType][property]] : property in item ? item[property] : null;
}

const getItemTitle = item => item.itemType === 'note' ?
	noteAsTitle(item.note) : getBaseMappedValue(item, 'title') || '';

const getAttachmentIcon = ({ linkMode, contentType }) => {
	switch(linkMode) {
		case 'linked_url':
			return 'web-page-linked';
		case 'imported_url':
			return 'web-page-snapshot';
		case 'linked_file':
			return contentType === 'application/pdf' ? 'pdf-linked' : 'document-linked';
		case 'imported_file':
		default:
			return contentType === 'application/pdf' ? 'pdf' : 'document';
	}
}

const getDerivedData = (item, itemTypes, tagColors) => {
	const { itemType, note, dateAdded, dateModified, extra } = item;
	const title = getItemTitle(item);
	const creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
		item[Symbol.for('meta')].creatorSummary :
		'';
	const date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
		item[Symbol.for('meta')].parsedDate :
		'';
	const colors = item.tags.reduce(
		(acc, { tag }) => {
			if(tag in tagColors) {
				acc.push(tagColors[tag]);
			}
			return acc;
		}, []
	);
	const itemTypeName = itemTypeLocalized(item, itemTypes);
	const iconName = item.itemType === 'attachment' ? getAttachmentIcon(item) : paramCase(itemTypeName);

	// same logic as https://github.com/zotero/zotero/blob/6abfd3b5b03969564424dc03313d63ae1de86100/chrome/content/zotero/xpcom/itemTreeView.js#L1062
	const year = date.substr(0, 4);

	return {
		colors,
		creator,
		date,
		dateAdded: dateLocalized(new Date(dateAdded)),
		dateModified: dateLocalized(new Date(dateModified)),
		extra,
		iconName,
		itemType: itemTypeName,
		key: item.key,
		publicationTitle: getBaseMappedValue(item, 'publicationTitle'),
		publisher: getBaseMappedValue(item, 'publisher'),
		title,
		year,
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

export { getDerivedData, getFieldDisplayValue, getBaseMappedValue, getItemTitle };

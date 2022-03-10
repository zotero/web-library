'use strict';

import baseMappings from 'zotero-base-mappings';
import { paramCase } from 'param-case';

import { noteAsTitle, itemTypeLocalized, dateLocalized } from './format';
import { cleanDOI, cleanURL, get } from '../utils';

const EMOJI_RE = /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

// Remove emoji and zero-width joiner and see if anything's left
// https://github.com/zotero/zotero/commit/f9035c8fda715add49c2b185ef7e240e7e045ec3
const _isOnlyEmoji = str => !str.replace(EMOJI_RE, '').replace(/\u200D/g,'');

const getBaseMappedValue = (item, property) => {
	const { itemType } = item;
	return itemType in baseMappings && property in baseMappings[itemType] ?
		item[baseMappings[itemType][property]] : property in item ? item[property] : null;
}

const getItemTitle = item => item.itemType === 'note' ?
	noteAsTitle(item.note) : getBaseMappedValue(item, 'title') || '';

// logic based on:
// https://github.com/zotero/zotero/blob/26ee0e294b604ed9ea473c76bb072715c318eac2/chrome/content/zotero/xpcom/data/item.js#L3697
const getAttachmentIcon = ({ linkMode, contentType }) => {
	if(contentType === 'application/pdf' && ['linked_file', 'imported_file'].includes(linkMode)) {
		return linkMode === 'linked_file' ? 'pdf-linked' : 'pdf';
	}

	switch(linkMode) {
		case 'linked_url':
			return 'webpage-linked';
		case 'imported_url':
			return 'webpage-snapshot';
		case 'linked_file':
			return 'document-linked';
		case 'imported_file':
		default:
			return 'document';
	}
}

// "attachment" column may be different from attachment icon, depending on context
const getAttachmentColumnIcon = item => {
	const bestAttachment = get(item, [Symbol.for('links'), 'attachment'], null);

	if(bestAttachment) {
		const { attachmentType, attachmentSize = null } = bestAttachment
		if(attachmentType === 'application/pdf' ) {
			return 'pdf';
		} else if(attachmentType === 'text/html' && attachmentSize === null) {
			return 'web-page-snapshot';
		} else {
			return 'document';
		}
	}

	if(item.itemType === 'attachment' && item.linkMode !== 'linked_file') {
		return getAttachmentIcon(item);
	}

	if(item.url) {
		const url = cleanURL(item.url, true);
		if(url) {
			return 'link';
		}
	}

	if(item.DOI) {
		const doi = cleanDOI(item.DOI);
		if(doi) {
			return 'link';
		}
	}

	return null;
}

const getDerivedData = (item, itemTypes, tagColors) => {
	const { itemType, dateAdded, dateModified, extra, journalAbbreviation, language, libraryCatalog,
	callNumber, rights } = item;

	const title = getItemTitle(item);
	const creator = item[Symbol.for('meta')] && item[Symbol.for('meta')].creatorSummary ?
		item[Symbol.for('meta')].creatorSummary :
		'';
	const date = item[Symbol.for('meta')] && item[Symbol.for('meta')].parsedDate ?
		item[Symbol.for('meta')].parsedDate :
		'';
	const emojis = [];
	const colors = item.tags.reduce(
		(acc, { tag }) => {
			if(tag in tagColors) {
				if(_isOnlyEmoji(tag)) {
					emojis.push(tag);
				} else {
					acc.push(tagColors[tag]);
				}
			}
			return acc;
		}, []
	);
	const createdByUser = item[Symbol.for('meta')] && item[Symbol.for('meta')].createdByUser ?
		item[Symbol.for('meta')].createdByUser.username :
		'';
	const itemTypeName = itemTypeLocalized(item, itemTypes);
	const iconName = item.itemType === 'attachment' ? getAttachmentIcon(item) : paramCase(item.itemType);


	// same logic as https://github.com/zotero/zotero/blob/6abfd3b5b03969564424dc03313d63ae1de86100/chrome/content/zotero/xpcom/itemTreeView.js#L1062
	const year = date.substr(0, 4);

	return {
		attachmentIconName: getAttachmentColumnIcon(item),
		colors,
		createdByUser,
		creator,
		date,
		dateAdded: dateLocalized(new Date(dateAdded)),
		dateModified: dateLocalized(new Date(dateModified)),
		emojis,
		extra,
		iconName,
		itemType: itemTypeName,
		itemTypeRaw: itemType,
		key: item.key,
		publicationTitle: getBaseMappedValue(item, 'publicationTitle'),
		publisher: getBaseMappedValue(item, 'publisher'),
		title,
		year,
		journalAbbreviation,
		language,
		libraryCatalog,
		callNumber,
		rights,
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

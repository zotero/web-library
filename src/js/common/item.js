import { cleanDOI, cleanURL, get } from '../utils';
import { noteAsTitle, itemTypeLocalized, dateLocalized } from './format';
import { itemTypesWithIcons } from '../../../data/item-types-with-icons.json';

// https://github.com/zotero/zotero/blob/256bd157edd7707aa1affa1822f68f41be1f988c/chrome/content/zotero/xpcom/utilities_internal.js#L408
const isOnlyEmoji = str => {
	// Remove emoji, Zero Width Joiner, and Variation Selector-16 and see if anything's left
	const re = /\p{Extended_Pictographic}|\u200D|\uFE0F/gu;
	return !str.replace(re, '');
}

const getBaseMappedValue = (mappings, item, property) => {
	const { itemType } = item;
	return itemType in mappings && property in mappings[itemType] ?
		item[mappings[itemType][property]] : property in item ? item[property] : null;
}

const getItemTitle = (mappings, item) => item.itemType === 'note' ?
	noteAsTitle(item.note) : getBaseMappedValue(mappings, item, 'title') || '';

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

const getItemTypeIcon = itemType => itemTypesWithIcons.includes(itemType) ? itemType.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : 'document';

// "attachment" column may be different from attachment icon, depending on context
const getAttachmentColumnIcon = item => {
	const bestAttachment = get(item, [Symbol.for('links'), 'attachment'], null);

	if(bestAttachment) {
		const { attachmentType, attachmentSize = null } = bestAttachment
		if(attachmentType === 'application/pdf' ) {
			return 'pdf';
		} else if(attachmentType === 'text/html' && attachmentSize === null) {
			return 'webpage-snapshot';
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

const getDerivedData = (mappings, item, itemTypes, tagColors) => {
	const { itemType, dateAdded, dateModified, extra, journalAbbreviation, language, libraryCatalog,
	callNumber, rights } = item;

	const title = getItemTitle(mappings, item);
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
				if(isOnlyEmoji(tag)) {
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
	const iconName = item.itemType === 'attachment' ? getAttachmentIcon(item) : getItemTypeIcon(item.itemType);


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
		publicationTitle: getBaseMappedValue(mappings, item, 'publicationTitle'),
		publisher: getBaseMappedValue(mappings, item, 'publisher'),
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

import { getZotero } from 'web-common/zotero';

import { cleanURL, get, extractEmoji } from '../utils';
import { dateLocalized } from './format';
import { itemTypesWithIcons } from '../../../data/item-types-with-icons.json';


const getBaseMappedValue = (mappings, item, property) => {
	const { itemType } = item;
	return itemType in mappings && property in mappings[itemType] ?
		item[mappings[itemType][property]] : property in item ? item[property] : null;
}

const getItemTitle = (mappings, item) => {
	if (item.itemType === 'note') {
		return getZotero().Utilities.Item.noteToTitle(item.note);
	}
	if (!item.itemType && item.name) {
		return item.name;
	}
	return getBaseMappedValue(mappings, item, 'title') || '';
}

// logic based on:
// https://github.com/zotero/zotero/blob/26ee0e294b604ed9ea473c76bb072715c318eac2/chrome/content/zotero/xpcom/data/item.js#L3697
const getAttachmentIcon = ({ linkMode, contentType = '' }) => {
	const isFileAttachment = ['linked_file', 'imported_file', 'imported_url'].includes(linkMode);
	if (contentType === 'application/pdf' && isFileAttachment) {
		return linkMode === 'linked_file' ? 'attachment-pdf-link' : 'attachment-pdf';
	}
	if (contentType === 'application/epub+zip' && isFileAttachment) {
		return linkMode === 'linked_file' ? 'attachment-epub-link' : 'attachment-epub';
	}
	if (contentType.startsWith('image/') && isFileAttachment) {
		return linkMode === 'linked_file' ? 'attachment-image-link' : 'attachment-image';
	}
	if (contentType.startsWith('video/') && isFileAttachment) {
		return linkMode === 'linked_file' ? 'attachment-video-link' : 'attachment-video';
	}

	switch(linkMode) {
		case 'linked_url':
			return 'attachment-web-link';
		case 'imported_url':
			return 'attachment-snapshot';
		case 'linked_file':
			return 'attachment-link';
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
		const { attachmentType = '', attachmentSize = null } = bestAttachment;

		if(attachmentType === 'application/pdf' ) {
			return 'attachment-pdf';
		} else if (attachmentType === 'application/epub+zip') {
			return 'attachment-epub';
		} else if(attachmentType.startsWith('image/')) {
			return 'attachment-image';
		} else if(attachmentType.startsWith('video/')) {
			return 'attachment-video';
		} else if(attachmentType === 'text/html' && attachmentSize === null) {
			return 'attachment-snapshot';
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
		const doi = getZotero().Utilities.cleanDOI(item.DOI);
		if(doi) {
			return 'link';
		}
	}

	return null;
}

// https://github.com/zotero/zotero/blob/d1f478fc4eb6fdb100598dc76d3bab7f59610393/chrome/content/zotero/itemTree.jsx#L3008-L3031
const getAttachmentTypeLabel = iconName => {
	switch(iconName) {
		case 'attachment-pdf':
		case 'attachment-pdf-link':
			return 'Has PDF Attachment';
		case 'attachment-epub':
		case 'attachment-epub-link':
			return 'Has EPUB Attachment';
		case 'attachment-image':
		case 'attachment-image-link':
			return 'Has Image Attachment';
		case 'attachment-video':
		case 'attachment-video-link':
			return 'Has Video Attachment';
		case 'attachment-snapshot':
			return 'Has Snapshot Attachment';
		case 'attachment-web-link':
			return 'Has Web Link Attachment';
		case 'attachment-link':
		case 'document':
			return 'Has Attachment';
		default:
			return null;
	}
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

	const colors = [];
	const emojis = [];

	if (!tagColors?.value || !tagColors?.lookup) {
		tagColors = { value: [], lookup: {} };
	}

	// colored tags, including emoji tags, ordered by position (value is an array ordered by position)
	tagColors.value.forEach(({ name, color }) => {
		if(!(item?.tags ?? []).some(({ tag }) => tag === name)) {
			return;
		}
		const emoji = extractEmoji(name);
		if (emoji.length > 0) {
			emojis.push(emoji);
		} else {
			colors.push(color);
		}
	});

	// non-colored tags containing emoji, sorted alphabetically (item.tags should already be sorted)
	(item?.tags ?? []).forEach(({ tag }) => {
		if (!(tag in tagColors.lookup)) {
			const emoji = extractEmoji(tag);
			if( emoji.length > 0) {
				emojis.push(emoji);
			}
		}
	});

	const createdByUser = item[Symbol.for('meta')] && item[Symbol.for('meta')].createdByUser ?
		item[Symbol.for('meta')].createdByUser.username :
		'';
	const itemTypeName = (itemTypes.find(({ itemType }) => itemType === item.itemType) || { localized: item.itemType }).localized;
	const iconName = (!item.itemType && item.name) ? 'folder' : item.itemType === 'attachment' ? getAttachmentIcon(item) : getItemTypeIcon(item.itemType);

	// same logic as https://github.com/zotero/zotero/blob/6abfd3b5b03969564424dc03313d63ae1de86100/chrome/content/zotero/xpcom/itemTreeView.js#L1062
	const year = date.substr(0, 4);

	const attachmentIconName = getAttachmentColumnIcon(item);
	const attachmentTypeLabel = getAttachmentTypeLabel(attachmentIconName);

	return {
		attachmentIconName,
		attachmentTypeLabel,
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

const calculateDerivedData = (item, { meta = { mappings: {}, itemTypes: [] }, tagColors } = {}) => {
	if (Array.isArray(item)) {
		return item.map(i => calculateDerivedData(i, { meta, tagColors }));
	}

	item[Symbol.for('derived')] = getDerivedData(meta.mappings, item, meta.itemTypes, tagColors);
	return item;
}

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

// https://github.com/zotero/zotero/blob/8d93fd4c8cfd0e75f88d99eab88307fba5e10380/chrome/content/zotero/xpcom/data/item.js#L3458
const getLastPageIndexSettingKey = (itemKey, libraryKey) =>
	`lastPageIndex_${libraryKey[0] === 'u' ? 'u' : libraryKey}_${itemKey}`;

const isWebAttachment = item => item.itemType === 'attachment' && !(item.linkMode === 'imported_file' || item.linkMode === 'linked_file');
const isFileAttachment = item => item.itemType === 'attachment' && item.linkMode !== 'linked_url';
const isPDFAttachment = item => isFileAttachment(item) && item.contentType === 'application/pdf';
const isEPUBAttachment = item => isFileAttachment(item) && item.contentType === 'application/epub+zip';
const isRegularItem = item => item?.itemType && !(item.itemType === 'note' || item.itemType === 'attachment' || item.itemType === 'annotation');

export { calculateDerivedData, getBaseMappedValue, getDerivedData, getFieldDisplayValue,
	getItemTitle, getLastPageIndexSettingKey, isWebAttachment, isFileAttachment, isPDFAttachment,
	isEPUBAttachment, isRegularItem };

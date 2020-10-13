'use strict';

export const hideFields = [
	'mimeType',
	'linkMode',
	'charset',
	'md5',
	'mtime',
	'version',
	'key',
	'collections',
	'relations',
	'parentItem',
	'contentType',
	'filename',
	'tags',
	'creator',
	'abstractNote',
	'notes'
];

export const noEditFields = [
	'createdByUser',
	'dateAdded',
	'dateModified',
	'filename',
	'lastModifiedByUser',
	'modified',
];

export const hideIfEmptyFields = [
	'createdByUser',
	'lastModifiedByUser',
];

// fields that are not included in itemTypeFields responses, but should be
// displayed for every item
export const extraFields = [
	{ field: 'dateAdded', localized: 'Date Added' },
	{ field: 'dateModified', localized: 'Date Modified' },
	{ field: 'createdByUser', path: [Symbol.for('meta'), 'createdByUser', 'username'], localized: 'Added By' },
	{ field: 'lastModifiedByUser', path: [Symbol.for('meta'), 'lastModifiedByUser', 'username'], localized: 'Modified By' },
];

'use strict';

import { getUserDisplayName } from '../utils';

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
	{ field: 'createdByUser', getValue: item => getUserDisplayName(item[Symbol.for('meta')]?.createdByUser), localized: 'Added By' },
	{ field: 'lastModifiedByUser', getValue: item => getUserDisplayName(item[Symbol.for('meta')]?.lastModifiedByUser), localized: 'Modified By' },
];

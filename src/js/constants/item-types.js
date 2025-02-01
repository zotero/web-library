'use strict';

// when creating a new item, types not on this list are hidden under "More"
const primaryItemTypes = [
	'book',
	'bookSection',
	'case',
	'hearing',
	'journalArticle',
];

// item types that cannot be created manually or changed to from another type
const ignoredItemTypes = ['note', 'attachment', 'annotation'];

export { primaryItemTypes, ignoredItemTypes };

'use strict';

const PropTypes = require('prop-types');
const baseMappings = require('zotero-base-mappings');

module.exports = Object.freeze({
	hideFields: [
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
	],

	noEditFields: [
		'modified',
		'filename',
		'dateAdded',
		'dateModified'
	],

	// fields that are not included in itemTypeFields responses, but should be
	// displayed for every item
	extraFields: [
		{ field: 'dateAdded', localized: 'Date Added' },
		{ field: 'dateModified', localized: 'Date Modified' },
	],

	baseMappings,
});

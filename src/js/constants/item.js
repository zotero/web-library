'use strict';

const React = require('react');
const PropTypes = require('prop-types');

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

	itemProp: PropTypes.shape({
		key: PropTypes.string,
		get: PropTypes.func,
		set: PropTypes.func
	})
});
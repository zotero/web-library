'use strict';

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

	baseMappings: {
		'bill': {
			'volume': 'codeVolume',
			'pages': 'codePages',
			'number': 'billNumber'
		},
		'case': {
			'volume': 'reporterVolume',
			'pages': 'firstPage',
			'date': 'dateDecided',
			'number': 'docketNumber',
			'title': 'caseName'
		},
		'artwork': {
			'medium': 'artworkMedium'
		},
		'audioRecording': {
			'medium': 'audioRecordingFormat',
			'publisher': 'label',
		},
		blogPost: {
			'publicationTitle': 'blogTitle',
			'type': 'websiteType',
		},
		bookSection: {
			'publicationTitle': 'bookTitle'
		},
		computerProgram: {
			'publisher': 'company'
		},
		conferencePaper: {
			'publicationTitle': 'proceedingsTitle'
		},
		dictionaryEntry: {
			'publicationTitle': 'dictionaryTitle'
		},
		email: {
			'title': 'subject'
		},
		encyclopediaEntry: {
			'publicationTitle': 'encyclopediaTitle'
		},
		film: {
			'medium': 'videoRecordingFormat',
			'publisher': 'distributor',
			'type': 'genre'
		},
		forumPost: {
			'publicationTitle': 'forumTitle',
			'type': 'postType'
		},
		hearing: {
			'number': 'documentNumber'
		},
		interview: {
			'medium': 'interviewMedium'
		},
		letter: {
			'type': 'letterType'
		},
		manuscript: {
			'type': 'manuscriptType'
		},
		map: {
			'type': 'mapType'
		},
		patent: {
			'date': 'issueDate',
			'number': 'patentNumber'
		},
		podcast: {
			'medium': 'audioFileType',
			'number': 'episodeNumber'
		},
		presentation: {
			'type': 'presentationType'
		},
		radioBroadcast: {
			'medium': 'audioRecordingFormat',
			'number': 'episodeNumber',
			'publicationTitle': 'programTitle',
			'publisher': 'network',
		},
		report: {
			'number': 'reportNumber',
			'publisher': 'institution',
			'type': 'reportType',
		},
		statute: {
			'date': 'dateEnacted',
			'number': 'publicLawNumber',
			'title': 'nameOfAct',
		},
		thesis: {
			'publisher': 'university',
			'type': 'thesisType',
		},
		tvBroadcast: {
			'medium': 'videoRecodingMedium',
			'number': 'episodeNumber',
			'publicationTitle': 'programTitle',
			'publisher': 'network',
		},
		videoRecording: {
			'medium': 'videoRecordingFormat',
			'publisher': 'studio',
		},
		webpage: {
			'publicationTitle': 'websiteTitle',
			'type': 'websiteType',
		}
	},
	itemProp: PropTypes.shape({
		key: PropTypes.string,
		get: PropTypes.func,
		set: PropTypes.func
	})
});
'use strict';

const { coreCitationStyles } = require('../../../data/citation-styles-data.json');

module.exports = Object.freeze({
	apiConfig: {
		apiAuthorityPart: 'api.zotero.org'
	},
	stylesSourceUrl: 'https://www.zotero.org/styles-files/styles.json',
	columnNames: {
		'creator': 'Creator',
	},
	columnMinWidthFraction: 0.05,
	preferences: {
		citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
		columns: [
			{ field: 'title', fraction: 0.5, isVisible: true, sort: 'ASC' },
			{ field: 'creator', fraction: 0.3, isVisible: true },
			{ field: 'date', fraction: 0.2, isVisible: true },
			{ field: 'itemType', fraction: 0.2, isVisible: false },
			{ field: 'year', fraction: 0.1, isVisible: false },
			{ field: 'publisher', fraction: 0.2, isVisible: false },
			{ field: 'publicationTitle', fraction: 0.2, isVisible: false },
			{ field: 'dateAdded', fraction: 0.1, isVisible: false },
			{ field: 'dateModified', fraction: 0.1, isVisible: false },
			{ field: 'extra', fraction: 0.2, isVisible: false },
		]
	}
});

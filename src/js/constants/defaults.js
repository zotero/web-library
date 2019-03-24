'use strict';

import { coreCitationStyles } from '../../../data/citation-styles-data.json';

export const apiConfig = {
	apiAuthorityPart: 'api.zotero.org'
};
export const stylesSourceUrl = 'https://www.zotero.org/styles-files/styles.json';
export const libraries = {
	includeMyLibrary: true,
	includeUserGroups: true,
	include: []
};
export const columnNames = {
	'creator': 'Creator',
};
export const columnMinWidthFraction = 0.05;
export const preferences = {
	citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
	installedCitationStyles: [],
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
};

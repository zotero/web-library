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

export const preferences = {
	citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
	citationLocale: 'en-US',
	installedCitationStyles: [],
	columns: [
		{
			field: 'title',
			fraction: 0.5,
			isVisible: true,
			minFraction: 0.1,
			sort: 'ASC',
		},
		{
			field: 'creator',
			fraction: 0.3,
			isVisible: true,
			minFraction: 0.05,
		},
		{
			field: 'date',
			fraction: 0.2,
			isVisible: true,
			minFraction: 0.05,
		},
		{
			field: 'itemType',
			fraction: 0.2,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'year',
			fraction: 0.1,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'publisher',
			fraction: 0.2,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'publicationTitle',
			fraction: 0.2,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'dateAdded',
			fraction: 0.1,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'dateModified',
			fraction: 0.1,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'extra',
			fraction: 0.2,
			isVisible: false,
			minFraction: 0.05,
		},
	]
};

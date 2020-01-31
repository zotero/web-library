'use strict';

import { coreCitationStyles } from '../../../data/citation-styles-data.json';

export const apiConfig = {
	apiAuthorityPart: 'api.zotero.org',
	retry: 2,
};
export const stylesSourceUrl = 'https://www.zotero.org/styles-files/styles.json';
export const translateUrl = 'location' in window ? window.location.origin : '';
export const tinymceRoot = '/static/other/tinymce/';
export const libraries = {
	includeMyLibrary: true,
	includeUserGroups: true,
	include: []
};
export const menus = { desktop: [], mobile: [] };
export const userId = 0;
export const userSlug = '';

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
			sort: 'asc',
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
		{
			field: 'createdByUser',
			fraction: 0.2,
			isVisible: false,
			minFraction: 0.05,
		},
		{
			field: 'attachment',
			fraction: 0.05,
			isVisible: false,
			minFraction: 0.05,
		},
	]
};

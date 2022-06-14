import { coreCitationStyles } from '../../../data/citation-styles-data.json';
export { version } from '../../../data/version.json';

export const apiConfig = {
	apiAuthorityPart: 'api.zotero.org',
	retry: 2,
};
export const websiteUrl = 'https://www.zotero.org/';
export const buyStorageUrl = websiteUrl + 'storage?ref=usb';
export const stylesSourceUrl = 'https://www.zotero.org/styles-files/styles.json';
export const streamingApiUrl = 'wss://stream.zotero.org/';
export const translateUrl = 'location' in window ? window.location.origin : '';
export const tinymceRoot = '/static/other/tinymce/';
export const pdfReaderURL = '/static/pdf-reader/viewer.html';
export const pdfReaderCMapsRoot = '/static/pdf-reader/cmaps/';
export const pdfWorkerURL = '/static/pdf-worker/worker.js';
export const maxColoredTags = 9;
export const libraries = {
	includeMyLibrary: true,
	includeUserGroups: true,
	include: []
};
export const menus = { desktop: [], mobile: [] };
export const userId = 0;
export const userSlug = '';
export const containterClassName = process.env.TARGET === 'embedded' ? 'zotero-wle' : 'zotero-wl';

export const preferences = {
	citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
	citationLocale: 'en-US',
	installedCitationStyles: [],
	//@NOTE: sum of all minFractions must be < 1.0
	columns: [
		{
			field: 'title',
			fraction: 0.45,
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
			field: 'journalAbbreviation',
			fraction: .2,
			isVisible: false,
			minFraction: .05
		},
		{
			field: 'language',
			fraction: .2,
			isVisible: false,
			minFraction: .05
		},
		{
			field: 'libraryCatalog',
			fraction: .2,
			isVisible: false,
			minFraction: .05,
		},
		{
			field: 'callNumber',
			fraction: .2,
			isVisible: false,
			minFraction: .05,
		},
		{
			field: 'rights',
			fraction: .2,
			isVisible: false,
			minFraction: .05,
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
			isVisible: true,
			minFraction: 0.05,
		},
	]
};

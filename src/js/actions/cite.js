import { CiteprocWrapper, fetchAndParseIndependentStyle, formatBib, formatFallback, getStyleProperties } from 'web-common/cite';
import { configureZoteroShim } from 'web-common/zotero';
import localeData from '../../../data/locale-data.json';

const supportedLocales = localeData.map(locale => locale.value);

export const bibliographyFromItems = (itemKeys, libraryKey, { style = 'chicago-notes-bibliography', locale = 'en-US' }) => {
	return async (dispatch, getState) => {
		style = 'chicago-notes-bibliography'; // TODO: make this configurable later
		const state = getState();
		const fakeIntl = { locale: 'en-US', formatMessage: ({ id, defaultMessage }) => defaultMessage || id };
		const Zotero = configureZoteroShim(state.meta.schema, fakeIntl);
		const { styleXml } = await fetchAndParseIndependentStyle(style);
		const { styleHasBibliography } = getStyleProperties(styleXml);
		const items = itemKeys.map(key => state.libraries[libraryKey].items[key]);
		const itemsCSL = items.map(i => Zotero.Utilities.Item.itemToCSLJSON({ ...i, uri: i.key, }));

		const citeproc = await CiteprocWrapper.new(styleXml, {
			citeprocJSPath: '/static/web-library/js/citeproc.js', // TODO: make this config-driven later
			format: 'html',
			formatOptions: { linkAnchors: true, },
			localeOverride: locale,
			localesPath: '/static/web-library/locales/', // TODO: make this config-driven later
			supportedLocales,
			useCiteprocJS: true,
		});
		citeproc.includeUncited("All");
		citeproc.insertReferences(itemsCSL);

		const bibliographyItems = citeproc.makeBibliography();
		const bibliographyMeta = citeproc.bibliographyMeta();
		const formattedBibliography = styleHasBibliography ? formatBib(bibliographyItems, bibliographyMeta) : formatFallback(bibliographyItems);

		citeproc.free();

		return formattedBibliography;
	};
};

export const bibliographyFromCollection = (collectionKey, libraryKey, { style = 'chicago-note-bibliography', locale = 'en-US' }) => {
	throw new Error("TODO: Implement bibliographyFromCollection");
};

import { CiteprocWrapper, fetchAndParseIndependentStyle, formatBib, formatFallback, getStyleProperties } from 'web-common/cite';
import { configureZoteroShim } from 'web-common/zotero';
import localeData from '../../../data/locale-data.json';

const supportedLocales = localeData.map(locale => locale.value);

export const bibliographyFromItems = (itemKeys, libraryKey, { style = 'chicago-notes-bibliography', locale = 'en-US' }) => {
	return async (dispatch, getState) => {
		const state = getState();
		const mockIntl = { locale: 'en-US', formatMessage: ({ id, defaultMessage }) => defaultMessage || id };
		const Zotero = configureZoteroShim(state.meta.schema, mockIntl);
		const { styleXml, parentStyleXml } = await fetchAndParseIndependentStyle(style);
		const relevantStyleXml = parentStyleXml ?? styleXml;
		const { styleHasBibliography } = getStyleProperties(relevantStyleXml);
		const items = itemKeys.map(key => state.libraries[libraryKey].items[key]);
		const itemsCSL = items.map(i => Zotero.Utilities.Item.itemToCSLJSON({ ...i, uri: i.key, }));

		const citeproc = await CiteprocWrapper.new(relevantStyleXml, {
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

		let bibliographyItems, bibliographyMeta;

		if (styleHasBibliography) {
			bibliographyItems = citeproc.makeBibliography();
			bibliographyMeta = citeproc.bibliographyMeta();
		} else {
			citeproc.initClusters(
				itemsCSL.map(item => ({ id: item.id, cites: [{ id: item.id }] }))
			);
			citeproc.setClusterOrder(itemsCSL.map(item => ({ id: item.id })));
			const render = citeproc.fullRender();
			bibliographyItems = itemsCSL.map(item => ({ id: item.id, value: render.allClusters[item.id] }));
		}
		const formattedBibliography = styleHasBibliography ?
			formatBib(bibliographyItems, bibliographyMeta) :
			formatFallback(bibliographyItems);

		citeproc.free();
		return formattedBibliography;
	};
};

export const bibliographyFromCollection = (collectionKey, libraryKey, { style = 'chicago-note-bibliography', locale = 'en-US' }) => {
	throw new Error("TODO: Implement bibliographyFromCollection");
};

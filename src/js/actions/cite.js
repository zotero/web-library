import { CiteprocWrapper, fetchAndParseIndependentStyle, formatBib, formatFallback, getStyleProperties } from 'web-common/cite';
import { BEGIN_FETCH_STYLE, COMPLETE_FETCH_STYLE, ERROR_FETCH_STYLE } from '../constants/actions';
import { configureZoteroShim } from 'web-common/zotero';
import localeData from '../../../data/locale-data.json';

const supportedLocales = localeData.map(locale => locale.value);

export const fetchCSLStyle = (styleName) => {
	return async (dispatch) => {
		dispatch({
			type: BEGIN_FETCH_STYLE,
			styleName,
		});

		try {
			const { styleXml, parentStyleXml } = await fetchAndParseIndependentStyle(styleName);
			const relevantStyleXml = parentStyleXml ?? styleXml;
			const styleProperties = getStyleProperties(relevantStyleXml);

			dispatch({
				type: COMPLETE_FETCH_STYLE,
				styleName,
				styleXml: relevantStyleXml,
				styleProperties,
			});
		} catch (error) {
			dispatch({
				type: ERROR_FETCH_STYLE,
				styleName,
				error: error.message,
			});
			throw error;
		}
	}
};

export const bibliographyFromItems = (itemKeys, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const mockIntl = { locale: 'en-US', formatMessage: ({ id, defaultMessage }) => defaultMessage || id };
		const Zotero = configureZoteroShim(state.meta.schema, mockIntl);
		const styleXml = state.cite.styleXml;
		const { styleHasBibliography, defaultLocale } = state.cite.styleProperties;
		const items = itemKeys.map(key => state.libraries[libraryKey].items[key]);
		const itemsCSL = items.map(i => Zotero.Utilities.Item.itemToCSLJSON({ ...i, uri: i.key, }));

		const citeproc = await CiteprocWrapper.new(styleXml, {
			citeprocJSPath: '/static/web-library/js/citeproc.js', // TODO: make this config-driven later
			format: 'html',
			formatOptions: { linkAnchors: true, },
			localeOverride: defaultLocale ? null : state.preferences.citationLocale ?? 'en-US',
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


export const citationFromItems = (itemKeys, modifiers, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const mockIntl = { locale: 'en-US', formatMessage: ({ id, defaultMessage }) => defaultMessage || id };
		const Zotero = configureZoteroShim(state.meta.schema, mockIntl);
		const styleXml = state.cite.styleXml;
		const { defaultLocale } = state.cite.styleProperties;
		const items = itemKeys.map(key => state.libraries[libraryKey].items[key]);
		const itemsCSL = items.map(i => Zotero.Utilities.Item.itemToCSLJSON({ ...i, uri: i.key, }));

		const citeproc = await CiteprocWrapper.new(styleXml, {
			citeprocJSPath: '/static/web-library/js/citeproc.js', // TODO: make this config-driven later
			format: 'html',
			formatOptions: { linkAnchors: true },
			localeOverride: defaultLocale ? null : state.preferences.citationLocale ?? 'en-US',
			localesPath: '/static/web-library/locales/', // TODO: make this config-driven later
			supportedLocales,
			useCiteprocJS: true,
		});

		citeproc.includeUncited("All");
		citeproc.insertReferences(itemsCSL);

		const cites = itemKeys.map((key) => ({ id: key, ...modifiers[key] }));
		const positions = [{}];

		const html = citeproc.previewCitationCluster(cites, positions, 'html');
		const plain = citeproc.previewCitationCluster(cites, positions, 'plain');

		return { html, plain };
	};
};

import { CiteprocWrapper, fetchAndParseIndependentStyle, formatBib, formatFallback, getStyleProperties } from 'web-common/cite';
import { BEGIN_FETCH_STYLE, COMPLETE_FETCH_STYLE, ERROR_FETCH_STYLE } from '../constants/actions';
import { BIBLIOGRAPHY, COPY_CITATION } from '../constants/modals';
import { getZotero } from 'web-common/zotero';
import { requestSchedule } from './request';
import { toggleModal } from './triggers';
import { cede } from '../utils';

import localeData from '../../../data/locale-data.json';
import { coreCitationStyles } from '../../../data/citation-styles-data.json';

const supportedLocales = localeData.map(locale => locale.value);
const defaultCitationStyle = coreCitationStyles.find(cs => cs.isDefault);
const MAX_STYLE_FETCH_RETRIES = 3;
let currentStyleRequest = null;

const fetchStyleWithRetries = async (styleName, stylesBaseUrl, isSuperseded) => {
	for (let attempt = 0; ; attempt++) {
		try {
			return await fetchAndParseIndependentStyle(styleName, stylesBaseUrl);
		} catch (error) {
			if (attempt >= MAX_STYLE_FETCH_RETRIES) {
				throw error;
			}
			await cede(requestSchedule[Math.min(attempt, requestSchedule.length - 1)] * 1000);
			if (isSuperseded()) {
				throw error;
			}
		}
	}
};

const getStyleTitle = (styleName, installedCitationStyles = []) =>
	[...coreCitationStyles, ...installedCitationStyles].find(cs => cs.name === styleName)?.title ?? styleName;

const getStyleErrorMessage = (styleTitle, { isFallback, canFallback }) => {
	if (isFallback) {
		return `The default citation style “${styleTitle}” could not be downloaded either. Please try again later.`;
	}
	if (canFallback) {
		return `Citation style “${styleTitle}” could not be downloaded. The default style “${defaultCitationStyle.title}” has been temporarily selected instead.`;
	}
	return `Citation style “${styleTitle}” could not be downloaded.`;
};

const fetchStyle = async (dispatch, getState, styleName, { isFallback = false } = {}) => {
	const request = Symbol(styleName);
	currentStyleRequest = request;
	const isSuperseded = () => currentStyleRequest !== request;
	const { stylesBaseUrl } = getState().config;

	dispatch({
		type: BEGIN_FETCH_STYLE,
		styleName,
	});

	try {
		const { styleXml, parentStyleXml } = await fetchStyleWithRetries(styleName, stylesBaseUrl, isSuperseded);
		if (isSuperseded()) {
			return;
		}
		const relevantStyleXml = parentStyleXml ?? styleXml;
		const styleProperties = getStyleProperties(relevantStyleXml);

		dispatch({
			type: COMPLETE_FETCH_STYLE,
			styleName,
			styleXml: relevantStyleXml,
			styleProperties,
		});
	} catch (error) {
		if (isSuperseded()) {
			return;
		}
		console.error(error);
		const canFallback = styleName !== defaultCitationStyle.name;
		const styleTitle = getStyleTitle(styleName, getState().preferences.installedCitationStyles);

		dispatch({
			type: ERROR_FETCH_STYLE,
			styleName,
			error: getStyleErrorMessage(styleTitle, { isFallback, canFallback }),
		});

		if (canFallback) {
			return fetchStyle(dispatch, getState, defaultCitationStyle.name, { isFallback: true });
		}

		// nothing can be rendered without a style, close the modal that requested it
		const { id: modalId, itemKeys, libraryKey } = getState().modal;
		if ([BIBLIOGRAPHY, COPY_CITATION].includes(modalId)) {
			dispatch(toggleModal(modalId, false, { itemKeys, libraryKey }));
		}
	}
};

// Fetches the style, retrying on failure. If the style still cannot be fetched, falls back to the
// default style for the current session only -- the user's preference is left untouched.
export const fetchCSLStyle = (styleName) => {
	return (dispatch, getState) => fetchStyle(dispatch, getState, styleName);
};

export const bibliographyFromItems = (itemKeys, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const Zotero = getZotero();
		const styleXml = state.cite.styleXml;
		const { styleHasBibliography, defaultLocale } = state.cite.styleProperties;
		const items = itemKeys.map(key => state.libraries[libraryKey].items[key]);
		const itemsCSL = items.map(i => Zotero.Utilities.Item.itemToCSLJSON({ ...i, uri: i.key, }));

		const citeproc = await CiteprocWrapper.new(styleXml, {
			citeprocJSPath: state.config.citeprocURL,
			format: 'html',
			formatOptions: { linkAnchors: true },
			localeOverride: defaultLocale ? null : state.preferences.citationLocale ?? 'en-US',
			localesPath: state.config.localesURL,
			supportedLocales,
			useCiteprocJS: true,
			// skip error checking and allow incomplete bibliographies
			// (items may be omitted if they cause errors or are empty, matching client's behavior)
			skipErrorChecking: true,
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
		const Zotero = getZotero();
		const styleXml = state.cite.styleXml;
		const { defaultLocale } = state.cite.styleProperties;
		const items = itemKeys.map(key => state.libraries[libraryKey].items[key]);
		const itemsCSL = items.map(i => Zotero.Utilities.Item.itemToCSLJSON({ ...i, uri: i.key, }));

		const citeproc = await CiteprocWrapper.new(styleXml, {
			citeprocJSPath: state.config.citeprocURL,
			format: 'html',
			formatOptions: { linkAnchors: true },
			localeOverride: defaultLocale ? null : state.preferences.citationLocale ?? 'en-US',
			localesPath: state.config.localesURL,
			supportedLocales,
			useCiteprocJS: true,
			skipErrorChecking: true,
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

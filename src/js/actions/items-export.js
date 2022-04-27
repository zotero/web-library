'use strict';

import api from 'zotero-api-client';

import {
	REQUEST_EXPORT_ITEMS,
	RECEIVE_EXPORT_ITEMS,
	ERROR_EXPORT_ITEMS,
	ERROR_EXPORT_COLLECTION,
	RECEIVE_EXPORT_COLLECTION,
	REQUEST_EXPORT_COLLECTION,
	REQUEST_CITE_ITEMS,
	RECEIVE_CITE_ITEMS,
	ERROR_CITE_ITEMS,
	REQUEST_BIBLIOGRAPHY_ITEMS,
	RECEIVE_BIBLIOGRAPHY_ITEMS,
	ERROR_BIBLIOGRAPHY_ITEMS,
	REQUEST_BIBLIOGRAPHY_COLLECTION,
	RECEIVE_BIBLIOGRAPHY_COLLECTION,
	ERROR_BIBLIOGRAPHY_COLLECTION,
} from '../constants/actions';

const exportItems = (itemKeys, libraryKey, format) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_EXPORT_ITEMS,
			itemKeys,
			libraryKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({ itemKey: itemKeys.join(','), includeTrashed: true, format });

			const exportData = await response.response.blob();

			dispatch({
				type: RECEIVE_EXPORT_ITEMS,
				itemKeys,
				libraryKey,
				exportData,
				response
			});

			return exportData;
		} catch(error) {
			dispatch({
				type: ERROR_EXPORT_ITEMS,
				error,
				itemKeys,
				libraryKey
			});
		}
	};
};

const exportCollection = (collectionKey, libraryKey, format) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_EXPORT_COLLECTION,
			collectionKey,
			libraryKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collectionKey)
				.items()
				.top()
				.get({ format });

			const exportData = await response.response.blob();

			dispatch({
				type: RECEIVE_EXPORT_COLLECTION,
				collectionKey,
				libraryKey,
				exportData,
				response
			});

			return exportData;
		} catch(error) {
			dispatch({
				type: ERROR_EXPORT_COLLECTION,
				error,
				collectionKey,
				libraryKey
			});
		}
	};
};

const citeItems = (itemKeys, libraryKey, style = 'chicago-note-bibliography', locale = 'en-US') => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_CITE_ITEMS,
			itemKeys,
			libraryKey,
			style,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({
					itemKey: itemKeys.join(','),
					include: 'citation',
					includeTrashed: true,
					style,
					locale
				});

			const citations = await response.getData().map(d => d.citation)

			dispatch({
				type: RECEIVE_CITE_ITEMS,
				itemKeys,
				libraryKey,
				citations,
				response,
			});

			return citations;
		} catch(error) {
			dispatch({
				type: ERROR_CITE_ITEMS,
				error,
				itemKeys,
				libraryKey,
			});
		}
	};
};

const bibliographyFromItems = (itemKeys, libraryKey, style = 'chicago-note-bibliography', locale = 'en-US') => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_BIBLIOGRAPHY_ITEMS,
			itemKeys,
			libraryKey,
			style,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({
					itemKey: itemKeys.join(','),
					format: 'bib',
					includeTrashed: true,
					style,
					locale,
				});

			const bibliography = await response.getData().text();

			dispatch({
				type: RECEIVE_BIBLIOGRAPHY_ITEMS,
				itemKeys,
				libraryKey,
				bibliography,
				response,
			});

			return bibliography;
		} catch(error) {
			dispatch({
				type: ERROR_BIBLIOGRAPHY_ITEMS,
				error,
				itemKeys,
				libraryKey,
			});
		}
	};
};

const bibliographyFromCollection = (collectionKey, libraryKey, style = 'chicago-note-bibliography', locale = 'en-US') => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_BIBLIOGRAPHY_COLLECTION,
			collectionKey,
			libraryKey,
			style,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collectionKey)
				.items()
				.top()
				.get({
					format: 'bib',
					style,
					locale,
				});

			const bibliography = await response.getData().text();

			dispatch({
				type: RECEIVE_BIBLIOGRAPHY_COLLECTION,
				collectionKey,
				libraryKey,
				bibliography,
				response,
			});

			return bibliography;
		} catch(error) {
			dispatch({
				type: ERROR_BIBLIOGRAPHY_COLLECTION,
				error,
				collectionKey,
				libraryKey,
			});
		}
	};
};


export { bibliographyFromCollection, bibliographyFromItems, exportCollection, exportItems, citeItems
	};

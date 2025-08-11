import api from 'zotero-api-client';

import {
	REQUEST_EXPORT_ITEMS,
	RECEIVE_EXPORT_ITEMS,
	ERROR_EXPORT_ITEMS,
	ERROR_EXPORT_COLLECTION,
	RECEIVE_EXPORT_COLLECTION,
	REQUEST_EXPORT_COLLECTION,
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
				.get({ itemKey: itemKeys.join(','), includeTrashed: 1, format });

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


export { exportCollection, exportItems };

import { REQUEST_DELETED_CONTENT, RECEIVE_DELETED_CONTENT, ERROR_DELETED_CONTENT } from '../constants/actions';
import api from 'zotero-api-client';

const fetchDeletedContentSince = (since, libraryKey) => {
	return async (dispatch, getState) => {
		const config = getState().config;
		dispatch({
			type: REQUEST_DELETED_CONTENT,
			libraryKey,
			since
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.deleted(since)
				.get();

			const data = response.getData();

			dispatch({
				type: RECEIVE_DELETED_CONTENT,
				libraryKey,
				since,
				response,
				itemKeys: data.items,
				collectionKeys: data.collections,
				tags: data.tags,
				settings: data.settings,
				searches: data.searches,
			});

			return data;
		} catch(error) {
			dispatch({
				type: ERROR_DELETED_CONTENT,
				libraryKey,
				since,
				error
			});
		}
	}
}

export {
	fetchDeletedContentSince
};

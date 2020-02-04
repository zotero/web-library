'use strict';

import api from 'zotero-api-client';
import { REQUEST_GROUPS, RECEIVE_GROUPS, ERROR_GROUPS, REQUEST_ALL_GROUPS, RECEIVE_ALL_GROUPS,
	ERROR_ALL_GROUPS } from '../constants/actions';


const fetchAllGroups = (libraryKey, { sort = 'dateModified', direction = "desc" } = {}) => {
	return async dispatch => {
		var pointer = 0;
		const limit = 100;
		var hasMore = false;

		dispatch({
			type: REQUEST_ALL_GROUPS,
			libraryKey
		});

		try {
			do {
				const response = await dispatch(fetchGroups(libraryKey, { start: pointer, limit, sort, direction }));
				const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);
				hasMore = totalResults > pointer + limit;
				pointer += limit;
			} while(hasMore === true);
			dispatch({
				type: RECEIVE_ALL_GROUPS,
				libraryKey
			});
		} catch(error) {
			dispatch({
				type: ERROR_ALL_GROUPS,
				libraryKey,
				error
			});
			throw error;
		}
	}
}

const fetchGroups = (libraryKey, queryOptions) => {
	return async (dispatch, getState) => {
		const { config } = getState();
		dispatch({
			type: REQUEST_GROUPS,
			libraryKey,
			queryOptions
		});
		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.groups()
				.get(queryOptions);
			const groups = response.getData();
			const totalResults = parseInt(response.response.headers.get('Total-Results'), 10);

			dispatch({
				type: RECEIVE_GROUPS,
				libraryKey,
				groups,
				response,
				queryOptions,
				totalResults,
			});
			return response;
		} catch(error) {
			dispatch({
				type: ERROR_GROUPS,
				libraryKey,
				queryOptions,
				error,
			});
			throw error;
		}
	};
};

export { fetchAllGroups, fetchGroups };


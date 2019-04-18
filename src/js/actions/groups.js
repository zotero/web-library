'use strict';

import api from 'zotero-api-client';
import { REQUEST_GROUPS, RECEIVE_GROUPS, ERROR_GROUPS } from '../constants/actions';


const fetchGroups = libraryKey => {
	return async (dispatch, getState) => {
		const { config } = getState();
		dispatch({
			type: REQUEST_GROUPS,
			libraryKey
		});
		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.groups()
				.get();
			const groups = response.getData();

			dispatch({
				type: RECEIVE_GROUPS,
				libraryKey,
				groups,
				response
			});
			return groups;
		} catch(error) {
			dispatch({
				type: ERROR_GROUPS,
				libraryKey,
				error
			});
			throw error;
		}
	};
};

export { fetchGroups };


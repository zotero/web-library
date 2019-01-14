'use strict';

const api = require('zotero-api-client')().api;
const {
	REQUEST_GROUPS,
	RECEIVE_GROUPS,
	ERROR_GROUPS,
} = require('../constants/actions');


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
			groups.sort(
				(a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase())
			);

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

module.exports = { fetchGroups };


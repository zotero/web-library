'use strict';

const { CONFIGURE_API, SORT_ITEMS } = require('../constants/actions.js');

const defaultState = {
	apiKey: null,
	apiConfig: {},
	userId: null,
	sortBy: 'title',
	sortDirection: 'asc'
};

const config = (state = defaultState, action) => {
	switch(action.type) {
		case CONFIGURE_API:
			return {
				...state,
				apiKey: action.apiKey,
				userId: action.userId,
				userLibraryKey: `u${action.userId}`,
				apiConfig: action.apiConfig,
			};
		case SORT_ITEMS:
			return {
				...state,
				sortBy: action.sortBy,
				sortDirection: action.sortDirection
			};
		default:
			return state;
	}
};

module.exports = config

'use strict';

import { CONFIGURE_API, SORT_ITEMS } from '../constants/actions.js';

const defaultState = {
	apiKey: null,
	apiConfig: {},
	userId: null,
	sortBy: 'title',
	sortDirection: 'asc',
	libraries: {}
};

const config = (state = defaultState, action) => {
	switch(action.type) {
		case CONFIGURE_API:
			return {
				...state,
				apiConfig: action.apiConfig,
				apiKey: action.apiKey,
				stylesSourceUrl: action.stylesSourceUrl,
				userId: action.userId,
				libraries: action.libraries,
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

export default config;

'use strict';

import { ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';

const defaultState = {
	isError: false,
	isSearching: false,
	reviewItem: null,
}

const identifier = (state = defaultState, action) => {
	switch (action.type) {
		case REQUEST_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: true,
				reviewItem: null
			};
		case RECEIVE_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: null,
				reviewItem: action.item
			};
		case ERROR_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: true,
				isSearching: null,
				reviewItem: null
			};
		case RESET_ADD_BY_IDENTIFIER:
			return defaultState;
		default:
			return state;
	}
}

export default identifier;

import { ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';

const defaultState = {
	isError: false,
	isSearching: false,
	isNoResults: false,
	item: null,
	items: null,
}

const identifier = (state = defaultState, action) => {
	switch (action.type) {
		case REQUEST_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: true,
				isNoResults: false,
				item: null,
				items: null,
			};
		case RECEIVE_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: null,
				isNoResults: action.isNoResults,
				item: action.item || null,
				items: action.items || null,
			};
		case ERROR_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: true,
				isSearching: null,
				isNoResults: false,
				item: null,
				items: null,
			};
		case RESET_ADD_BY_IDENTIFIER:
			return defaultState;
		default:
			return state;
	}
}

export default identifier;

import { ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER,
	RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';

const defaultState = {
	isError: false,
	isSearching: false,
}

const identifier = (state = defaultState, action) => {
	switch (action.type) {
		case REQUEST_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: true,
			};
		case RECEIVE_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: null,
			};
		case ERROR_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: true,
				isSearching: null,
			};
		case RESET_ADD_BY_IDENTIFIER:
			return defaultState;
		default:
			return state;
	}
}

export default identifier;

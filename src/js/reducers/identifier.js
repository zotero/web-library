import { BEGIN_SEARCH_MULTIPLE_IDENTIFIERS, COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
	ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER, RECEIVE_ADD_BY_IDENTIFIER,
	RESET_ADD_BY_IDENTIFIER } from '../constants/actions';

const defaultState = {
	isError: false,
	isSearching: false,
	result: null,
	item: null,
	items: null,
	identifierIsUrl: null,
}

const identifier = (state = defaultState, action) => {
	switch (action.type) {
		case BEGIN_SEARCH_MULTIPLE_IDENTIFIERS:
			return { ...state, isSearchingMultiple: true }
		case COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS:
			return { ...state, isSearchingMultiple: false, translatedItems: action.items }
		case REQUEST_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: true,
				identifierIsUrl: action.identifierIsUrl,
				result: null,
				item: null,
				items: null,
			};
		case RECEIVE_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: null,
				identifierIsUrl: action.identifierIsUrl,
				result: action.result,
				item: action.item || null,
				items: action.items || null,
			};
		case ERROR_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: true,
				isSearching: null,
				result: null,
				item: null,
				items: null,
				identifierIsUrl: null,
			};
		case RESET_ADD_BY_IDENTIFIER:
			return defaultState;
		default:
			return state;
	}
}

export default identifier;

import { BEGIN_SEARCH_MULTIPLE_IDENTIFIERS, COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
	REQUEST_ADD_BY_IDENTIFIER, RECEIVE_ADD_BY_IDENTIFIER, RESET_ADD_BY_IDENTIFIER } from '../constants/actions';

const defaultState = {
	isSearching: false,
	session: null,
	result: null,
	item: null,
	items: null,
	identifier: null,
	identifierIsUrl: null,
	import: false,
	message: null
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
				isSearching: true,
				identifier: action.identifier,
				identifierIsUrl: action.identifierIsUrl,
				session: null,
				result: null,
				item: null,
				items: null,
				import: action.import,
			};
		case RECEIVE_ADD_BY_IDENTIFIER:
			return {
				...state,
				isSearching: false,
				identifierIsUrl: action.identifierIsUrl,
				session: action.session || null,
				result: action.result,
				item: action.item || null,
				items: action.items || null,
				import: action.import,
				message: action.message,
			};
		case RESET_ADD_BY_IDENTIFIER:
			return defaultState;
		default:
			return state;
	}
}

export default identifier;

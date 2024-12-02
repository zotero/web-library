import { BEGIN_SEARCH_MULTIPLE_IDENTIFIERS, COMPLETE_SEARCH_MULTIPLE_IDENTIFIERS,
	ERROR_ADD_BY_IDENTIFIER, REQUEST_ADD_BY_IDENTIFIER, RECEIVE_ADD_BY_IDENTIFIER,
	RESET_ADD_BY_IDENTIFIER, REQUEST_IDENTIFIER_MORE, RECEIVE_IDENTIFIER_MORE, ERROR_IDENTIFIER_MORE
	} from '../constants/actions';

const defaultState = {
	isError: false,
	isSearching: false,
	session: null,
	result: null,
	item: null,
	items: null,
	identifier: null,
	identifierIsUrl: null,
	import: false,
	next: null,
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
				identifier: action.identifier,
				identifierIsUrl: action.identifierIsUrl,
				session: null,
				result: null,
				item: null,
				items: null,
				import: action.import,
				next: null,
			};
		case RECEIVE_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: false,
				isSearching: false,
				identifierIsUrl: action.identifierIsUrl,
				session: action.session || null,
				result: action.result,
				item: action.item || null,
				items: action.items || null,
				import: action.import,
				next: action.next,
			};
		case ERROR_ADD_BY_IDENTIFIER:
			return {
				...state,
				isError: true,
				isSearching: false,
				session: null,
				result: null,
				item: null,
				items: null,
				identifierIsUrl: null,
				import: action.import,
				next: null,
			};
		case REQUEST_IDENTIFIER_MORE:
			return {
				...state,
				isSearching: true,
				next: null,
			}
		case RECEIVE_IDENTIFIER_MORE:
			return {
				...state,
				isSearching: false,
				result: action.result,
				items: {...(state.items || []), ...(action.items || [])},
				next: action.next,
			}
		case ERROR_IDENTIFIER_MORE:
			return {
				...state,
				isError: true,
				isSearching: false,
				session: null,
				result: null,
				item: null,
				items: null,
				identifierIsUrl: null,
				next: null
			}
		case RESET_ADD_BY_IDENTIFIER:
			return defaultState;
		default:
			return state;
	}
}

export default identifier;

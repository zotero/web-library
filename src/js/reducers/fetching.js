import {
	REQUEST_ITEM_TEMPLATE,
	RECEIVE_ITEM_TEMPLATE,
	ERROR_ITEM_TEMPLATE,
	REQUEST_TAGS_IN_LIBRARY,
	RECEIVE_TAGS_IN_LIBRARY,
	ERROR_TAGS_IN_LIBRARY,
	REQUEST_ALL_GROUPS,
	RECEIVE_ALL_GROUPS,
	ERROR_ALL_GROUPS,
} from '../constants/actions';

const fetching = (state = {
	creatorTypes: [],
	itemTemplates: [],
	itemTypeCreatorTypes: [],
	itemTypeFields: [],
	tagsInLibrary: [],
	meta: false,
	allGroups: false,
}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_LIBRARY:
			return {
				...state,
				tagsInLibrary: [
					...(state.tagsInLibrary || []),
					action.libraryKey
				]
			};
		case RECEIVE_TAGS_IN_LIBRARY:
		case ERROR_TAGS_IN_LIBRARY:
			return {
				...state,
				tagsInLibrary: (state.tagsInLibrary || [])
					.filter(key => key !== action.libraryKey)
			};
		case REQUEST_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: [
					...(state.itemTemplates || []),
					action.itemType
				]
			};
		case RECEIVE_ITEM_TEMPLATE:
		case ERROR_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: state.itemTemplates
					.filter(it => it !== action.itemType)
			};
		case REQUEST_ALL_GROUPS:
			return {
				...state,
				allGroups: true
			}
		case RECEIVE_ALL_GROUPS:
		case ERROR_ALL_GROUPS:
			return {
				...state,
				allGroups: false,
			}
		default:
			return state;
	}
};

export default fetching;

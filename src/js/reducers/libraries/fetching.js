'use strict';

import {
    REQUEST_FETCH_ITEMS,
    RECEIVE_FETCH_ITEMS,
    ERROR_FETCH_ITEMS,
    REQUEST_TAGS_IN_COLLECTION,
    RECEIVE_TAGS_IN_COLLECTION,
    ERROR_TAGS_IN_COLLECTION,
    REQUEST_LIBRARY_SETTINGS,
    RECEIVE_LIBRARY_SETTINGS,
    ERROR_LIBRARY_SETTINGS
} from '../../constants/actions';

const fetching = (state = {
	items: [],
	itemsInCollection: [],
	childItems: [],
	tagsInCollection: [],
	librarySettings: false,
}, action) => {
	switch(action.type) {
		case REQUEST_LIBRARY_SETTINGS:
			return {
				...state,
				librarySettings: true
			}
		case RECEIVE_LIBRARY_SETTINGS:
		case ERROR_LIBRARY_SETTINGS:
			return {
				...state,
				librarySettings: false
			}
		case REQUEST_FETCH_ITEMS:
			return {
				...state,
				items: [...(new Set([
					...(state.items || []),
					...action.itemKeys
				]))]
			};
		case RECEIVE_FETCH_ITEMS:
		case ERROR_FETCH_ITEMS:
			return {
				...state,
				items: state.items.filter(key => action.itemKeys.includes(key))
			};
		case REQUEST_TAGS_IN_COLLECTION:
			return {
				...state,
				tagsInCollection: [
					...(state.tagsInCollection || []),
					action.collectionKey
				]
			}
		case RECEIVE_TAGS_IN_COLLECTION:
		case ERROR_TAGS_IN_COLLECTION:
			return {
				...state,
				tagsInCollection: state.tagsInCollection
					.filter(key => key !== action.collectionKey)
			};
		default:
			return state;
	}
}

export default fetching;

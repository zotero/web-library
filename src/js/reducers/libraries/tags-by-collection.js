'use strict';

import {
	ERROR_TAGS_IN_COLLECTION,
	RECEIVE_TAGS_IN_COLLECTION,
	REQUEST_TAGS_IN_COLLECTION,
} from '../../constants/actions';
import { deduplicate } from '../../utils';

const tags = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...(state[action.collectionKey] || {}),
					isFetching: true
				}
			}
		case RECEIVE_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					isFetching: false,
					pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
						&& !('tag' in action.queryOptions))
						? action.queryOptions.start + action.queryOptions.limit : state[action.collectionKey].pointer,
					totalResults: action.queryOptions.tag ? state[action.collectionKey].totalResults : action.totalResults,
					tags: deduplicate([...(state.tags || []), ...action.tags.map(t => t.tag)]),
				}
			}
		case ERROR_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...(state[action.collectionKey] || {}),
					isFetching: false
				}
			}
		// case RECEIVE_ADD_ITEMS_TO_COLLECTION:
		// 	return {
		// 		...state,
		// 		[action.collectionKey]: {
		// 			...(state[action.collectionKey] || {}),
		// 			totalResults: null,
		// 			tags
		// 		}
		// 	}
		default:
			return state;
	}
};

export default tags;

'use strict';

import {
	REQUEST_TAGS_FOR_ITEM, RECEIVE_TAGS_FOR_ITEM, ERROR_TAGS_FOR_ITEM,
	RECEIVE_FETCH_ITEMS, RECEIVE_ITEMS_IN_COLLECTION, RECEIVE_TOP_ITEMS,
	RECEIVE_TRASH_ITEMS,
} from '../../constants/actions';
import { indexByKey } from '../../utils';
import { deduplicate } from '../../utils';

const tags = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				...indexByKey(action.items, 'key', ({ key, tags }) => ({
					totalResults: tags.length,
					tags: state[key] || []
				}))
			}
		case REQUEST_TAGS_FOR_ITEM:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					isFetching: true
				}
			}
		case RECEIVE_TAGS_FOR_ITEM:
			return {
				...state,
				[action.itemKey]: {
					isFetching: false,
					pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
						&& !('tag' in action.queryOptions))
						? action.queryOptions.start + action.queryOptions.limit : state[action.itemKey].pointer,
					totalResults: action.queryOptions.tag ? state[action.itemKey].totalResults : action.totalResults,
					tags: deduplicate([...(state.tags || []), ...action.tags.map(t => t.tag)]),
				}
			}
		case ERROR_TAGS_FOR_ITEM:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					isFetching: false
				}
			}
		default:
			return state;
	}
};

export default tags;

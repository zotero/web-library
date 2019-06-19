'use strict';

import {
	REQUEST_TAGS_FOR_ITEM, RECEIVE_TAGS_FOR_ITEM, ERROR_TAGS_FOR_ITEM,
	RECEIVE_FETCH_ITEMS, RECEIVE_ITEMS_IN_COLLECTION, RECEIVE_TOP_ITEMS,
	RECEIVE_TRASH_ITEMS,
} from '../../constants/actions';
import { indexByKey } from '../../utils';

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
					totalResults: action.queryOptions.tag ? state.totalResults : action.totalResults,
					tags: [...(new Set([
						...(state[action.itemKey].tags || []),
						...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`)
					]))]
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

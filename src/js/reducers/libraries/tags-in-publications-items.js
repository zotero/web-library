'use strict';

import {
	ERROR_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS,
	REQUEST_TAGS_IN_PUBLICATIONS_ITEMS,
} from '../../constants/actions';
import { deduplicateByHash } from '../../utils';

const tagsInPublicationsItems = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				isFetching: true
			}
		case RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				isFetching: false,
				pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
					&& !('tag' in action.queryOptions))
					? action.queryOptions.start + action.queryOptions.limit : state.pointer,
				totalResults: action.queryOptions.tag ? state.totalResults : action.totalResults,
				tags: deduplicateByHash([...(state.tags || []), ...action.tags], t => t.tag + t.type),
			};
		case ERROR_TAGS_IN_PUBLICATIONS_ITEMS:
			return { ...state, isFetching: false };
		default:
			return state;
	}
};

export default tagsInPublicationsItems;

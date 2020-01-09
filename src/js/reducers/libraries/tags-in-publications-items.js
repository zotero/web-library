'use strict';

import {
	ERROR_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_UPDATE_ITEM,
	REQUEST_TAGS_IN_PUBLICATIONS_ITEMS,
} from '../../constants/actions';
import { deduplicate } from '../../utils';
import { updateFetchingState } from '../../common/reducers';

const tagsInPublicationsItems = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
					&& !('tag' in action.queryOptions))
					? action.queryOptions.start + action.queryOptions.limit : state.pointer,
				totalResults: action.queryOptions.tag ? state.totalResults : action.totalResults,
				tags: deduplicate([...(state.tags || []), ...action.tags.map(t => t.tag)]),
				...(action.queryOptions.tag ? {} : updateFetchingState(state, action)),
			};
		case ERROR_TAGS_IN_PUBLICATIONS_ITEMS:
			return { ...state, ...updateFetchingState(state, action), };
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? {} : state;
		default:
			return state;
	}
};

export default tagsInPublicationsItems;

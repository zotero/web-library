'use strict';

import {
	ERROR_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_COLORED_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_UPDATE_ITEM,
	REQUEST_TAGS_IN_PUBLICATIONS_ITEMS,
} from '../../constants/actions';
import { populateTags, updateFetchingState } from '../../common/reducers';

const tagsInPublicationsItems = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...populateTags(state, action.tags, action),
				...updateFetchingState(state, action),
			}
		case RECEIVE_COLORED_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				coloredTags: action.tags.map(t => t.tag)
			}
		case ERROR_TAGS_IN_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			};
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? {} : state;
		default:
			return state;
	}
};

export default tagsInPublicationsItems;

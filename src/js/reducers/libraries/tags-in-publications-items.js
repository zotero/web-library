'use strict';

import {
	ERROR_TAGS_IN_PUBLICATIONS_ITEMS,
	RECEIVE_TAGS_IN_PUBLICATIONS_ITEMS,
	REQUEST_TAGS_IN_PUBLICATIONS_ITEMS,
} from '../../constants/actions';

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
				totalResults: action.queryOptions.tag ? state.totalResults : action.totalResults,
				tags: [...(new Set([
					...(state.tags || []),
					...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`),
				]))],
			};
		case ERROR_TAGS_IN_PUBLICATIONS_ITEMS:
			return { ...state, isFetching: false };
		default:
			return state;
	}
};

export default tagsInPublicationsItems;

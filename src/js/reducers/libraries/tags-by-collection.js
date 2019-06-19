'use strict';

import {
	ERROR_TAGS_IN_COLLECTION,
	RECEIVE_TAGS_IN_COLLECTION,
	REQUEST_TAGS_IN_COLLECTION,
} from '../../constants/actions';

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
					totalResults: action.queryOptions.tag ? state.totalResults : action.totalResults,
					tags: [...(new Set([
						...(state[action.collectionKey].tags || []),
						...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`)
					]))]
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
		default:
			return state;
	}
};

export default tags;

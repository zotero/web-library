'use strict';

import {
	ERROR_TAGS_IN_LIBRARY,
	RECEIVE_TAGS_IN_LIBRARY,
	REQUEST_TAGS_IN_LIBRARY
} from '../../constants/actions';

const tagsTop = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_LIBRARY:
			return {
				...state,
				isFetching: true
			}
		case RECEIVE_TAGS_IN_LIBRARY:
			return {
				isFetching: false,
				totalResults: parseInt(
					action.response.response.headers.get('Total-Results'), 10
				),
				tags: [...(new Set([
					...(state.tags || []),
					...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`),
				]))],
			};
		case ERROR_TAGS_IN_LIBRARY:
			return { ...state, isFetching: false };
		default:
			return state;
	}
};

export default tagsTop;

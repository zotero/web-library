'use strict';

import { RECEIVE_TAGS_IN_LIBRARY } from '../../constants/actions';

const tagsTop = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_TAGS_IN_LIBRARY:
			return [
				...(new Set([
					...state,
					...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`),
				]))
			];
		default:
			return state;
	}
};

export default tagsTop;

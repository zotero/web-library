'use strict';

import { RECEIVE_TAGS_IN_COLLECTION } from '../../constants/actions';

const tags = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: [
					...(new Set([
						...(state[action.collectionKey] || []),
						...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`)
					]))
				]
			}
		default:
			return state;
	}
};

export default tags;

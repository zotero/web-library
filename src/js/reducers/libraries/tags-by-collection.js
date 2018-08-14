'use strict';

const {
	RECEIVE_TAGS_IN_COLLECTION,
} = require('../../constants/actions');

const tags = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TAGS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: action.tags.map(t => t.tag)
			}
		default:
			return state;
	}
};

module.exports = tags;

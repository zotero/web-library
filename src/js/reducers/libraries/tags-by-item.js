'use strict';

const {
	RECEIVE_TAGS_FOR_ITEM,
} = require('../../constants/actions');

const tags = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TAGS_FOR_ITEM:
			return {
				...state,
				[action.itemKey]: [
					...(new Set([
						...(state[action.itemKey] || []),
						...action.tags.map(tag => `${tag.tag}-${tag[Symbol.for('meta')].type}`)
					]))
				]
			}
		default:
			return state;
	}
};

module.exports = tags;

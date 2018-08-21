'use strict';

const {
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const itemsByQuery = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_ITEMS_BY_QUERY:
			return {
				...state,
				[action.serializedQuery]: [
					...(new Set([
						...(state[action.serializedQuery] || []),
						...action.items.map(item => item.key)
					]))
				]
			};
		default:
			return state;
	}
};

module.exports = itemsByQuery;

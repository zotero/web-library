'use strict';

const {
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const itemCountByQuery = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_ITEMS_BY_QUERY:
			return {
				...state,
				[action.serializedQuery]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		default:
			return state;
	}
};

module.exports = itemCountByQuery;

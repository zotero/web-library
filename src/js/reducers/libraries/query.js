'use strict';

const {
	REQUEST_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const query = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_ITEMS_BY_QUERY:
		case RECEIVE_ITEMS_BY_QUERY:
			return {
				...action.query
			};
		default:
			return state;
	}
};

module.exports = query;

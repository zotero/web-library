'use strict';

const {
	QUERY_CHANGE,
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const queryItems = (state = null, action) => {
	switch(action.type) {
		case QUERY_CHANGE:
			return null;
		case RECEIVE_ITEMS_BY_QUERY:
			return parseInt(action.response.response.headers.get('Total-Results'), 10);
		default:
			return state;
	}
};

module.exports = queryItems;

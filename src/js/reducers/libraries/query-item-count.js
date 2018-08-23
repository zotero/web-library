'use strict';

const {
	REQUEST_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const queryItems = (state = null, action) => {
	switch(action.type) {
		case REQUEST_ITEMS_BY_QUERY:
			return action.isQueryChanged ? null : state;
		case RECEIVE_ITEMS_BY_QUERY:
			return parseInt(action.response.response.headers.get('Total-Results'), 10);
		default:
			return state;
	}
};

module.exports = queryItems;

'use strict';

const {
	QUERY_CHANGE,
} = require('../../constants/actions.js');

const query = (state = {}, action) => {
	switch(action.type) {
		case QUERY_CHANGE:
			return {
				...action.newQuery
			};
		default:
			return state;
	}
};

module.exports = query;

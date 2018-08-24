'use strict';

const {
	QUERY_CHANGE,
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const queryItems = (state = [], action) => {
	switch(action.type) {
		case QUERY_CHANGE:
			return [];
		case RECEIVE_ITEMS_BY_QUERY:
			if(action.isQueryChanged) {
				return [...action.items.map(item => item.key)];
			} else {
				return [
					...(new Set([
						...state,
						...action.items.map(item => item.key)
					]))
				];
			}
		default:
			return state;
	}
};

module.exports = queryItems;

'use strict';

const {
	REQUEST_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
} = require('../../constants/actions.js');

const queryItems = (state = [], action) => {
	switch(action.type) {
		case REQUEST_ITEMS_BY_QUERY:
			return action.isQueryChanged ? [] : state;
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

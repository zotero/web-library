'use strict';

const {
	RECEIVE_PUBLICATIONS_ITEMS,
} = require('../constants/actions.js');

const defaultState = {
	publications: null
};

const itemCount = (state = defaultState, action) => {
	switch(action.type) {
		case RECEIVE_PUBLICATIONS_ITEMS:
		return {
			...state,
			publications: parseInt(action.response.response.headers.get('Total-Results'), 10)
		}
		default:
			return state;
	}
};

module.exports = itemCount;

'use strict';

const { RECEIVE_TOP_ITEMS } = require('../constants/actions');

const itemCountTopByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TOP_ITEMS:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		default:
			return state;
	}
};

module.exports = itemCountTopByLibrary;

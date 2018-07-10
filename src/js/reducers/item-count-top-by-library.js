'use strict';

const { RECEIVE_TOP_ITEMS, RECEIVE_MOVE_ITEMS_TRASH } = require('../constants/actions');

const itemCountTopByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TOP_ITEMS:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		case RECEIVE_MOVE_ITEMS_TRASH:
			return {
				...state,
				[action.libraryKey]: Math.max(
					(state[action.libraryKey] || 0) - action.itemKeysTop.length,
					0
				)
			}
		default:
			return state;
	}
};

module.exports = itemCountTopByLibrary;

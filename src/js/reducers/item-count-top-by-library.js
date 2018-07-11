'use strict';

const {
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
} = require('../constants/actions');

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
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return {
				...state,
				[action.libraryKey]: (state[action.libraryKey] || 0) + action.itemKeysTop.length
			}
		default:
			return state;
	}
};

module.exports = itemCountTopByLibrary;

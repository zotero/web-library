'use strict';

const {
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TRASH_ITEMS,
} = require('../constants/actions');

const itemCountTrashByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
	case RECEIVE_MOVE_ITEMS_TRASH:
		if(!(action.libraryKey in state)) { return state; }
		return {
			...state,
			[action.libraryKey]: state[action.libraryKey] + action.itemKeys.length
		}
	case RECEIVE_RECOVER_ITEMS_TRASH:
		if(!(action.libraryKey in state)) { return state; }
		return {
			...state,
			[action.libraryKey]: state[action.libraryKey] - action.itemKeys.length
		}
	default:
		return state;
	}
};

module.exports = itemCountTrashByLibrary;

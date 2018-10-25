'use strict';

const {
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
} = require('../constants/actions');

const itemCountTopByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(!action.item.parentItem) {
				return {
					...state,
					[action.libraryKey]: state[action.libraryKey] + 1
				}
			} else {
				return state;
			}
		case RECEIVE_CREATE_ITEMS:
			return {
				...state,
				[action.libraryKey]: action.items.reduce(
					(aggr, item) => item.parentItem ? aggr : aggr + 1,
					state[action.libraryKey]
				)
			}
		case RECEIVE_TOP_ITEMS:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		case RECEIVE_MOVE_ITEMS_TRASH:
			if(!(action.libraryKey in state)) { return state; }
			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] - action.itemKeysTop.length
			}
		case RECEIVE_RECOVER_ITEMS_TRASH:
			if(!(action.libraryKey in state)) { return state; }
			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] + action.itemKeysTop.length
			}
		default:
			return state;
	}
};

module.exports = itemCountTopByLibrary;

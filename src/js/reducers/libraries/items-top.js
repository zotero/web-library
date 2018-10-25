'use strict';

const {
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
} = require('../../constants/actions.js');

const itemsTop = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(!action.item.parentItem) {
				return [...state, action.item.key]
			} else {
				return state;
			}
		case RECEIVE_CREATE_ITEMS:
			return [...state, ...action.items.filter(i => !i.parentItem).map(i => i.key)];
		case RECEIVE_DELETE_ITEM:
			return state.filter(key => key !== action.item.key);
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
			return state.filter(key => !action.itemKeys.includes(key));
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return [...state, ...action.itemKeysTop];
		case RECEIVE_TOP_ITEMS:
			return [
				...(new Set([
					...state,
					...action.items.map(item => item.key)
				]))
			];
		default:
			return state;
	}
};

module.exports = itemsTop;

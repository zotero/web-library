'use strict';

const {
	RECEIVE_CREATE_ITEM,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_TRASH_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_CREATE_ITEMS,
} = require('../../constants/actions.js');

const itemsTop = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEMS:
		case RECEIVE_CREATE_ITEM:
			// @TODO:
			return state;
		case RECEIVE_DELETE_ITEM:
			return state.filter(key => key !== action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return state.filter(key => !action.itemKeys.includes(key));
		case RECEIVE_TRASH_ITEMS:
			return [
				...(new Set([
					...state,
					...action.items.map(item => item.key)
				]))
			];
		case RECEIVE_MOVE_ITEMS_TRASH:
			return [
				...state,
				...action.itemKeys
			];
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return state.filter(itemKey => !action.itemKeys.includes(itemKey));
		default:
			return state;
	}
};

module.exports = itemsTop;

'use strict';

const { populate, inject } = require('../../common/reducers');
const {
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
	SORT_ITEMS,
} = require('../../constants/actions.js');

const itemsTop = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(!action.item.parentItem) {
				return inject(state, action.item.key);
			} else {
				return state;
			}
		case RECEIVE_CREATE_ITEMS:
			return inject(state, action.items.filter(i => !i.parentItem).map(i => i.key));
		case RECEIVE_DELETE_ITEM:
			return state.filter(key => key !== action.item.key);
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
			return state.filter(key => !action.itemKeys.includes(key));
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return inject(state, action.itemKeys);
		case RECEIVE_TOP_ITEMS:
			return populate(
				state, action.items.map(item => item.key), action.start,
				action.limit, action.totalResults
			);
		case SORT_ITEMS:
			return new Array(state.length);
		default:
			return state;
	}
};

module.exports = itemsTop;

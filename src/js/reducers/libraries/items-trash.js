'use strict';

const { populate, inject } = require('../../common/reducers');
const {
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_TRASH_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	SORT_ITEMS,
} = require('../../constants/actions.js');

const itemsTrash = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_DELETE_ITEM:
			return state.filter(key => key !== action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return state.filter(key => !action.itemKeys.includes(key));
		case RECEIVE_MOVE_ITEMS_TRASH:
			return inject(state, action.itemKeys);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return state.filter(itemKey => !action.itemKeys.includes(itemKey));
		case RECEIVE_TRASH_ITEMS:
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

module.exports = itemsTrash;

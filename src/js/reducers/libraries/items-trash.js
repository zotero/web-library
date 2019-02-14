'use strict';

const { indexByKey } = require('../../utils');
const { filterItemKeys, injectExtraItemKeys, populateItemKeys,
	sortItemKeysOrClear } = require('../../common/reducers');
const {
	ERROR_TRASH_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TRASH_ITEMS,
	REQUEST_TRASH_ITEMS,
	SORT_ITEMS,
} = require('../../constants/actions.js');

const itemsTrash = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_DELETE_ITEM:
			return filterItemKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_MOVE_ITEMS_TRASH:
			return injectExtraItemKeys(
				state,
				action.itemKeys,
				{ ...action.otherItems, ...indexByKey(action.items) }
			);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return filterItemKeys(state, action.itemKeys);
		case REQUEST_TRASH_ITEMS:
		case ERROR_TRASH_ITEMS:
			return {
				...state,
				isFetching: action.type === REQUEST_TRASH_ITEMS
			}
		case RECEIVE_TRASH_ITEMS:
			return populateItemKeys(
				state, action.items.map(item => item.key), action
			);
		case SORT_ITEMS:
			return sortItemKeysOrClear(
				state, action.items, action.sortBy, action.sortDirection
			);
		default:
			return state;
	}
};

module.exports = itemsTrash;

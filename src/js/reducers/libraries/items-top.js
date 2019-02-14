'use strict';

const { indexByKey } = require('../../utils');
const { injectExtraItemKeys,filterItemKeys, populateItemKeys,
	sortItemKeysOrClear } = require('../../common/reducers');
const {
	ERROR_TOP_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
	REQUEST_TOP_ITEMS,
	SORT_ITEMS,
} = require('../../constants/actions.js');

const itemsTop = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(!action.item.parentItem) {
				return injectExtraItemKeys(
					state,
					action.item.key,
					{ ...action.otherItems, [action.item.key]: action.item }
				);
			} else {
				return state;
			}
		case RECEIVE_CREATE_ITEMS:
			return injectExtraItemKeys(
				state,
				action.items.filter(i => !i.parentItem).map(i => i.key),
				{ ...action.otherItems, ...indexByKey(action.items) }
			);
		case RECEIVE_DELETE_ITEM:
			return filterItemKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return injectExtraItemKeys(
				state,
				action.itemKeys,
				{ ...action.otherItems, ...indexByKey(action.items) }
			);
		case REQUEST_TOP_ITEMS:
		case ERROR_TOP_ITEMS:
			return {
				...state,
				isFetching: action.type === REQUEST_TOP_ITEMS
			}
		case RECEIVE_TOP_ITEMS:
			return populateItemKeys(
				state, action.items.map(item => item.key), action
			);
		case SORT_ITEMS:
			return sortItemKeysOrClear(state, action.items, action.sortBy, action.sortDirection);
		default:
			return state;
	}
};

module.exports = itemsTop;

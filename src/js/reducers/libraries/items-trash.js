'use strict';

import { indexByKey } from '../../utils';
import { filterItemKeys, injectExtraItemKeys, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../../common/reducers';

import {
    ERROR_TRASH_ITEMS,
    RECEIVE_DELETE_ITEM,
    RECEIVE_DELETE_ITEMS,
    RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_RECOVER_ITEMS_TRASH,
    RECEIVE_TRASH_ITEMS,
    REQUEST_TRASH_ITEMS,
    SORT_ITEMS,
} from '../../constants/actions.js';

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
			return {
				...state,
				...updateFetchingState(state, action)
			}
		case RECEIVE_TRASH_ITEMS:
			return {
				...populateItemKeys(state, action.items.map(item => item.key), action),
				...updateFetchingState(state, action),
			}
		case ERROR_TRASH_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
				isError: true
			}
		case SORT_ITEMS:
			return sortItemKeysOrClear(
				state, action.items, action.sortBy, action.sortDirection
			);
		default:
			return state;
	}
};

export default itemsTrash;

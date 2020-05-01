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
    RECEIVE_FETCH_ITEMS,
    SORT_ITEMS,
} from '../../constants/actions.js';

const detectChangesInTrash = (state, action, items) => {
	if(!('keys' in state)) {
		return state;
	}

	var newState = { ...state };

	action.items.forEach(item => {
		if(item.deleted && !newState.keys.includes(item.key)) {
			console.log(`inject ${item.key} into trash`);
			newState = injectExtraItemKeys(newState, item.key, items);
		} else if(!item.deleted && newState.keys.includes(item.key)) {
			console.log(`remove ${item.key} from trash`);
			newState = filterItemKeys(newState, item.key)
		}
	});

	return newState;
}

const itemsTrash = (state = {}, action, { items }) => {
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
		case RECEIVE_FETCH_ITEMS:
			return detectChangesInTrash(state, action, items);
		default:
			return state;
	}
};

export default itemsTrash;

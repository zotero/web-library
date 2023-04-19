import { indexByKey } from '../../utils';
import { filterItemKeys, injectExtraItemKeys, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../../common/reducers';

import {
    DROP_TRASH_ITEMS, ERROR_TRASH_ITEMS, RECEIVE_DELETE_ITEM, RECEIVE_DELETE_ITEMS,
    RECEIVE_DELETED_CONTENT, RECEIVE_FETCH_ITEMS, RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_RECOVER_ITEMS_TRASH, RECEIVE_TRASH_ITEMS, REQUEST_TRASH_ITEMS, SORT_ITEMS,
} from '../../constants/actions.js';

const detectChangesInTrash = (mappings, state, action, items) => {
	if(!('keys' in state)) {
		return state;
	}

	var newState = { ...state };
	const keysToInject = [];
	const keysToRemove = [];

	action.items.forEach(item => {
		if(item.deleted && !newState.keys.includes(item.key)) {
			keysToInject.push(item.key);
		} else if(!item.deleted && newState.keys.includes(item.key)) {
			keysToRemove.push(item.key);
		}
	});

	if(keysToInject.length > 0) {
		const allItems = { ...items, ...indexByKey(action.items) };
		newState = injectExtraItemKeys(mappings, newState, keysToInject, allItems);
	}

	if(keysToRemove.length > 0) {
		newState = filterItemKeys(newState, keysToRemove)
	}

	return newState;
}

const itemsTrash = (state = {}, action, { items, meta }) => {
	switch(action.type) {
		case RECEIVE_DELETE_ITEM:
			return filterItemKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_DELETED_CONTENT:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_MOVE_ITEMS_TRASH:
			return injectExtraItemKeys(
				meta.mappings,
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
		case DROP_TRASH_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
				isError: true
			}
		case SORT_ITEMS:
			return sortItemKeysOrClear(
				meta.mappings, state, action.items, action.sortBy, action.sortDirection
			);
		case RECEIVE_FETCH_ITEMS:
			return detectChangesInTrash(meta.mappings, state, action, items);
		default:
			return state;
	}
};

export default itemsTrash;

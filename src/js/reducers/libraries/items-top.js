import { indexByKey } from '../../utils';
import { injectExtraItemKeys, filterItemKeys, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../../common/reducers';

import {
	DROP_TOP_ITEMS,
	ERROR_TOP_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_DELETED_CONTENT,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
	REQUEST_TOP_ITEMS,
	SORT_ITEMS,
} from '../../constants/actions.js';

const detectChangesInTop = (state, action, items) => {
	if(!('keys' in state)) {
		return state;
	}

	var newState = { ...state };
	const keysToInject = [];
	const keysToRemove = [];

	action.items.forEach(item => {
		if(!item.deleted && !item.parentItem && !newState.keys.includes(item.key)) {
			keysToInject.push(item.key);
		} else if((item.deleted || item.parentItem) && newState.keys.includes(item.key)) {
			keysToRemove.push(item.key);
		}
	});

	if(keysToInject.length > 0) {
		const allItems = { ...items, ...indexByKey(action.items) };
		newState = injectExtraItemKeys(newState, keysToInject, allItems);
	}

	if(keysToRemove.length > 0) {
		newState = filterItemKeys(newState, keysToRemove)
	}

	return newState;
}

const itemsTop = (state = {}, action, { items }) => {
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
		case RECEIVE_DELETED_CONTENT:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return injectExtraItemKeys(
				state,
				action.itemKeys,
				{ ...action.otherItems, ...indexByKey(action.items) }
			);
		case REQUEST_TOP_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action)
			}
		case RECEIVE_TOP_ITEMS:
			return {
				...populateItemKeys(state, action.items.map(item => item.key), action),
				...updateFetchingState(state, action),
			}
		case ERROR_TOP_ITEMS:
		case DROP_TOP_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
				isError: true
			}
		case RECEIVE_FETCH_ITEMS:
			return detectChangesInTop(state, action, items);
		case SORT_ITEMS:
			return sortItemKeysOrClear(state, action.items, action.sortBy, action.sortDirection);
		default:
			return state;
	}
};

export default itemsTop;

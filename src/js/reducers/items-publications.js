'use strict';

import { indexByKey } from '../utils';
import { filterItemKeys, injectExtraItemKeys, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../common/reducers';

import {
	REQUEST_PUBLICATIONS_ITEMS,
	ERROR_PUBLICATIONS_ITEMS,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_PUBLICATIONS_ITEMS,
	RECEIVE_RECOVER_ITEMS_TRASH,
	SORT_ITEMS,
} from '../constants/actions.js';

const itemsPublications = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action)
			}
		case RECEIVE_PUBLICATIONS_ITEMS:
			return {
				...populateItemKeys(state, action.items.map(item => item.key), action),
				...updateFetchingState(state, action)
			}
		case ERROR_PUBLICATIONS_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
				isError: true
			}
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return injectExtraItemKeys(
				state,
				action.itemKeys,
				{ ...action.otherItems, ...indexByKey(action.items) }
			);
		case SORT_ITEMS:
			return sortItemKeysOrClear(state, action.items, action.sortBy, action.sortDirection);
		default:
			return state;
	}
};

export default itemsPublications;

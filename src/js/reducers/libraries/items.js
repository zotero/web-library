'use strict';

import {
    RECEIVE_ADD_ITEMS_TO_COLLECTION,
    RECEIVE_CHILD_ITEMS,
    RECEIVE_CREATE_ITEM,
    RECEIVE_CREATE_ITEMS,
    RECEIVE_DELETE_ITEM,
    RECEIVE_DELETE_ITEMS,
    RECEIVE_FETCH_ITEMS,
    RECEIVE_ITEMS_BY_QUERY,
    RECEIVE_ITEMS_IN_COLLECTION,
    RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_PUBLICATIONS_ITEMS,
    RECEIVE_RECOVER_ITEMS_TRASH,
    RECEIVE_RELATED_ITEMS,
    RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
    RECEIVE_TOP_ITEMS,
    RECEIVE_TRASH_ITEMS,
    RECEIVE_UPDATE_ITEM,
} from '../../constants/actions.js';

import { get, indexByKey } from '../../utils';
import { removeKeys } from '../../common/immutable';

const items = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				[action.item.key]: action.item
			};
		case RECEIVE_DELETE_ITEM:
			return removeKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return removeKeys(state, action.itemKeys);
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				[action.itemKey]: {
					...get(state, action.itemKey, {}),
					...action.item
				}
			};
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
			return {
				...state,
				...indexByKey(Object.values(action.items), 'key', item => ({
					...state[item.key],
					...item
				}))
			}
		case RECEIVE_CHILD_ITEMS:
			return {
				...state,
				...indexByKey(action.items, 'key')
			};
		case RECEIVE_CREATE_ITEMS:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_ITEMS_BY_QUERY:
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_PUBLICATIONS_ITEMS:
		case RECEIVE_RELATED_ITEMS:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				...indexByKey(action.items, 'key')
			};
		default:
			return state;
	}
};

export default items;

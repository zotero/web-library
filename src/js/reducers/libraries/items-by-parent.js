'use strict';
import { populateItemKeys, filterItemKeys, sortItemKeysOrClear, injectExtraItemKeys } from '../../common/reducers';
import { indexByKey, get } from '../../utils';
import { mapObject } from '../../common/immutable';

import {
	RECEIVE_RECOVER_ITEMS_TRASH,
    ERROR_CHILD_ITEMS,
    RECEIVE_CHILD_ITEMS,
    RECEIVE_CREATE_ITEM,
    RECEIVE_CREATE_ITEMS,
    RECEIVE_DELETE_ITEM,
    RECEIVE_DELETE_ITEMS,
    RECEIVE_FETCH_ITEMS,
    RECEIVE_ITEMS_BY_QUERY,
    RECEIVE_ITEMS_IN_COLLECTION,
    RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_TOP_ITEMS,
    RECEIVE_TRASH_ITEMS,
    RECEIVE_UPDATE_ITEM,
    REQUEST_CHILD_ITEMS,
    SORT_ITEMS,
} from '../../constants/actions.js';

const itemsByParent = (state = {}, action) => {
	var parentKey;
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			parentKey = get(action, 'item.parentItem');
			if(parentKey && parentKey in state) {
				return {
					...state,
					[parentKey]: injectExtraItemKeys(
						state,
						action.item.key,
						{ ...action.otherItems, [action.item.key]: action.item }
					)
				};
			}
			return state;
		case RECEIVE_RECOVER_ITEMS_TRASH:
		case RECEIVE_CREATE_ITEMS:
			var otherItems = { ...action.otherItems, ...indexByKey(action.items) };
			return {
				...state,
				...(action.items.reduce((aggr, item) => {
					parentKey = item.parentItem;
					if(parentKey) {
						// @TODO: Optimise (inject loops over all items of the first argument)
						if(parentKey in aggr) {
							aggr[parentKey] = injectExtraItemKeys(
								aggr[parentKey], item.key, otherItems
							);
						} else if(parentKey in state) {
							aggr[parentKey] = injectExtraItemKeys(
								state[parentKey], item.key, otherItems
							);
						}
					}
					return aggr;
				}, {}))
			};
		case RECEIVE_DELETE_ITEM:
			parentKey = get(action, 'item.parentItem');
			if(parentKey) {
				return {
					...state,
					[parentKey]: filterItemKeys(state[parentKey] || {}, action.item.key)
				};
			}
			return state;
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_DELETE_ITEMS:
			return Object.entries(state).reduce((aggr, [parentKey, itemKeys]) => {
				aggr[parentKey] = filterItemKeys(itemKeys, action.itemKeys);
				return aggr;
			}, {});
		case REQUEST_CHILD_ITEMS:
		case ERROR_CHILD_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					...state[action.itemKey],
					isFetching: action.type === REQUEST_CHILD_ITEMS,
					isError: action.type === ERROR_CHILD_ITEMS
				}
			}
		case RECEIVE_CHILD_ITEMS:
			return {
				...state,
				[action.itemKey]: populateItemKeys(
					state[action.itemKey] || {},
					action.items.map(item => item.key),
					action
				)
			};
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
		case RECEIVE_ITEMS_BY_QUERY:
			return {
				...state,
				...action.items.reduce((aggr, item, index) => {
					aggr[item.key] = {
						totalResults: action.response.getMeta()[index].numChildren
					};
					return aggr;
				}, {})
			}
		case RECEIVE_UPDATE_ITEM:
			if(!('parentItem' in action.patch)) {
				return state;
			}
			parentKey = get(action, 'item.parentItem');
			return mapObject(state, (pk, childKeys) => {
				if(pk === parentKey) {
					return [pk, injectExtraItemKeys(
						childKeys,
						action.item.key,
						{ ...action.otherItems, [action.item.key]: action.item }
					)];
				} else {
					return [pk, filterItemKeys(childKeys, action.item.key)];
				}
			});
		default:
			return state;
	}
};

export default itemsByParent;

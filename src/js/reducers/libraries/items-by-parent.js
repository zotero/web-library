import { populateItemKeys, filterItemKeys, injectExtraItemKeys, updateFetchingState } from
'../../common/reducers';
import { indexByKey, get } from '../../utils';
import { mapObject } from '../../common/immutable';

import {
	RECEIVE_RECOVER_ITEMS_TRASH, DROP_CHILD_ITEMS, ERROR_CHILD_ITEMS, RECEIVE_CHILD_ITEMS,
	RECEIVE_CREATE_ITEM, RECEIVE_CREATE_ITEMS, RECEIVE_DELETE_ITEM, RECEIVE_DELETE_ITEMS,
	RECEIVE_DELETED_CONTENT, RECEIVE_FETCH_ITEMS, RECEIVE_MOVE_ITEMS_TRASH, RECEIVE_UPDATE_ITEM,
	REQUEST_CHILD_ITEMS,
} from '../../constants/actions.js';

const detectChangesInParent = (state, action, items) => {
	const newState = { ...state };
	const allItems = { ...items, ...indexByKey(action.items) };

	action.items.forEach(item => {
		if(item.parentItem && item.parentItem in newState && !get(newState, [item.parentItem, 'keys'], []).includes(item.key) && !item.deleted) {
			newState[item.parentItem] = injectExtraItemKeys(newState[item.parentItem], item.key, allItems);
		}

		Object.entries(newState).forEach(([parentKey, itemKeysData]) => {
			if('keys' in itemKeysData && itemKeysData.keys.includes(item.key) && (!item.parentItem === parentKey || item.deleted)) {
				newState[parentKey] = filterItemKeys(itemKeysData, item.key);
			}
		});
	});

	return newState;
}

const itemsByParent = (state = {}, action, { items }) => {
	var parentKey;
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			parentKey = get(action, 'item.parentItem');
			if(parentKey && parentKey in state) {
				return {
					...state,
					[parentKey]: injectExtraItemKeys(
						state[parentKey],
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
		case RECEIVE_DELETED_CONTENT:
			return Object.entries(state).reduce((aggr, [parentKey, itemKeys]) => {
				aggr[parentKey] = filterItemKeys(itemKeys, action.itemKeys);
				return aggr;
			}, {});
		case REQUEST_CHILD_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					...state[action.itemKey],
					...updateFetchingState(state[action.itemKey] || {}, action),
				}
			}
		case RECEIVE_CHILD_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					...populateItemKeys(
						state[action.itemKey] || {},
						action.items.map(item => item.key),
						action
					),
					...updateFetchingState(state[action.itemKey] || {}, action),
				}
			};
		case ERROR_CHILD_ITEMS:
		case DROP_CHILD_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					...state[action.itemKey],
					...updateFetchingState(state[action.itemKey] || {}, action),
					isError: true
				}
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
		case RECEIVE_FETCH_ITEMS:
			return {
				...state,
				...detectChangesInParent(state, action, items)
			}
		default:
			return state;
	}
};

export default itemsByParent;

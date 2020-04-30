import { indexByKey } from '../../utils';
import { mapObject } from '../../common/immutable';
import { populateItemKeys, filterItemKeys, sortItemKeysOrClear, injectExtraItemKeys, updateFetchingState } from '../../common/reducers';

import {
    ERROR_ITEMS_IN_COLLECTION,
    RECEIVE_ADD_ITEMS_TO_COLLECTION,
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    RECEIVE_CREATE_ITEM,
    RECEIVE_CREATE_ITEMS,
    RECEIVE_DELETE_ITEM,
    RECEIVE_DELETE_ITEMS,
    RECEIVE_ITEMS_IN_COLLECTION,
    RECEIVE_MOVE_ITEMS_TRASH,
    RECEIVE_RECOVER_ITEMS_TRASH,
    RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
    RECEIVE_UPDATE_ITEM,
    REQUEST_ITEMS_IN_COLLECTION,
    RECEIVE_FETCH_ITEMS,
    SORT_ITEMS,
} from '../../constants/actions.js';

const detectChangesInMembership = (action, state, items) => {
	const newState = { ...state };

	action.items.forEach(item => {
		item.collections.forEach(collectionKey => {
			if(collectionKey in newState && 'keys' in newState[collectionKey] && !newState[collectionKey].keys.includes(item.key) && !item.deleted) {
				// updated item now belongs to collectionKey (or has been recovered from trash)
				console.log(`detectChangesInMembership: inject ${item.key} into ${collectionKey}`);
				newState[collectionKey] = injectExtraItemKeys(newState[collectionKey], item.key, items);
			}
		});

		Object.entries(newState).forEach(([collectionKey, itemKeysData]) => {
			if('keys' in itemKeysData && itemKeysData.keys.includes(item.key) && (!item.collections.includes(collectionKey) || item.deleted)) {
				// updated item has been removed from collectionKey (or deleted)
				console.log(`detectChangesInMembership: remove ${item.key} from ${collectionKey}`);
				newState[collectionKey] = filterItemKeys(itemKeysData, item.key);
			}
		});
	});

	return newState;
}

const itemsByCollection = (state = {}, action, items) => {
	//@TODO: action.otherItems is deprecated, use items
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(action.item.parentItem) { return state; }
			return {
				...state,
				...(action.item.collections.reduce(
					(aggr, collectionKey) => {
						aggr[collectionKey] = injectExtraItemKeys(
							state[collectionKey] || {},
							[action.item.key],
							{ ...action.otherItems, [action.item.key]: action.item }
						)
						return aggr;
					}, {}))
			}
		case RECEIVE_CREATE_ITEMS:
			var otherItems = { ...action.otherItems, ...indexByKey(action.items) };
			return {
				...state,
				...(action.items.reduce((aggr, item) => {
					item.collections.forEach(
						collectionKey => {
							//@TODO: Optimise (inject loops over all items of the first argument)
							if(collectionKey in aggr) {
								aggr[collectionKey] = injectExtraItemKeys(
									aggr[collectionKey], item.key, otherItems
								);
							} else if(collectionKey in state) {
								aggr[collectionKey] = injectExtraItemKeys(
									state[collectionKey], item.key, otherItems
								);
							}
					});
					return aggr;
				}, {}))
			};
		case RECEIVE_DELETE_ITEM:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = filterItemKeys(itemKeys, action.item.key);
				return aggr;
			}, {});
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = filterItemKeys(itemKeys, action.itemKeys);
				return aggr;
			}, {});
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = injectExtraItemKeys(
					itemKeys,
					action.itemKeysByCollection[collectionKey] || [],
					{ ...action.otherItems, ...indexByKey(action.items) }
				);
				return aggr;
			}, {});
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
			return {
				...state,
				[action.collectionKey]: injectExtraItemKeys(
					state[action.collectionKey] || {},
					action.itemKeysChanged.filter(iKey =>
						action.items.find(item => item.key === iKey && !item.deleted)
					),
					{ ...action.otherItems, ...indexByKey(action.items) }
				)
			}
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
			return {
				...state,
				[action.collectionKey]: filterItemKeys(
					state[action.collectionKey] || {}, action.itemKeysChanged
				)
			}
		case REQUEST_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					...updateFetchingState(state[action.collectionKey] || {}, action),
				}
			}
		case RECEIVE_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...populateItemKeys(
						state[action.collectionKey] || {},
						action.items.map(item => item.key),
						action
					),
					...updateFetchingState(state[action.collectionKey] || {}, action)
				}
			};
		case ERROR_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					...updateFetchingState(state[action.collectionKey] || {}, action),
					isError: true
				}
			}
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...(action.response.getData().reduce((aggr, collection, index) => {
					aggr[collection.key] = {
						...(state[collection.key] || {}),
						totalResults: action.response.getMeta()[index].numItems
					}
					return aggr;
				}, {}))
			};
		case RECEIVE_UPDATE_ITEM:
			if(!('collections' in action.patch)) {
				return state;
			}
			return mapObject(state, (colKey, itemKeys) => {
				if(action.item.collections.includes(colKey)) {
					return [colKey, injectExtraItemKeys(
						itemKeys,
						action.item.key,
						{ ...action.otherItems, [action.item.key]: action.item }
					)];
				} else {
					return [colKey, filterItemKeys(itemKeys, action.item.key)];
				}
			});
		case SORT_ITEMS:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = sortItemKeysOrClear(
					itemKeys, action.items, action.sortBy, action.sortDirection
				);
				return aggr
			}, {});
		case RECEIVE_FETCH_ITEMS:
			return detectChangesInMembership(action, state, items);
		default:
			return state;
	}
};

export default itemsByCollection;

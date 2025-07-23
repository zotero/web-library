import { mapObject } from 'web-common/utils';

import { indexByKey } from '../../utils';
import { populateItemKeys, filterItemKeys, sortItemKeysOrClear, injectExtraItemKeys,
updateFetchingState } from '../../common/reducers';

import {
	DROP_ITEMS_IN_COLLECTION, ERROR_ITEMS_IN_COLLECTION, RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_COLLECTIONS_IN_LIBRARY, RECEIVE_CREATE_ITEM, RECEIVE_CREATE_ITEMS, RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS, RECEIVE_DELETED_CONTENT, RECEIVE_FETCH_ITEMS, RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_MOVE_ITEMS_TRASH, RECEIVE_RECOVER_ITEMS_TRASH, RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_UPDATE_ITEM, REQUEST_ITEMS_IN_COLLECTION, SORT_ITEMS, RECEIVE_UPDATE_MULTIPLE_ITEMS
} from '../../constants/actions.js';

const detectChangesInMembership = (mappings, state, action, items) => {
	const newState = { ...state };
	const allItems = { ...items, ...indexByKey(action.items) };

	action.items.forEach(item => {
		if(!('collections' in item)) {
			return;
		}
		item.collections.forEach(collectionKey => {
			if(collectionKey in newState && (!('keys' in newState[collectionKey]) || !newState[collectionKey].keys.includes(item.key)) && !item.deleted) {
				// updated item now belongs to collectionKey (or has been recovered from trash)
				newState[collectionKey] = injectExtraItemKeys(mappings, newState[collectionKey], item.key, allItems);
			}
		});

		Object.entries(newState).forEach(([collectionKey, itemKeysData]) => {
			if('keys' in itemKeysData && itemKeysData.keys.includes(item.key) && (!item.collections.includes(collectionKey) || item.deleted)) {
				// updated item has been removed from collectionKey (or deleted)
				newState[collectionKey] = filterItemKeys(itemKeysData, item.key);
			}
		});
	});

	return newState;
}

const itemsByCollection = (state = {}, action, { items, meta }) => {
	//@TODO: action.otherItems is deprecated, use items
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(action.item.parentItem) { return state; }
			return {
				...state,
				...(action.item.collections.reduce(
					(aggr, collectionKey) => {
						aggr[collectionKey] = injectExtraItemKeys(
							meta.mappings,
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
					(item?.collections ?? []).forEach(
						collectionKey => {
							//@TODO: Optimise (inject loops over all items of the first argument)
							if(collectionKey in aggr) {
								aggr[collectionKey] = injectExtraItemKeys(
									meta.mappings, aggr[collectionKey], item.key, otherItems
								);
							} else if(collectionKey in state) {
								aggr[collectionKey] = injectExtraItemKeys(
									meta.mappings, state[collectionKey], item.key, otherItems
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
		case RECEIVE_DELETED_CONTENT:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = filterItemKeys(itemKeys, action.itemKeys);
				return aggr;
			}, {});
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = injectExtraItemKeys(
					meta.mappings,
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
					meta.mappings,
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
		case DROP_ITEMS_IN_COLLECTION:
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
						meta.mappings,
						itemKeys,
						action.item.key,
						{ ...action.otherItems, [action.item.key]: action.item }
					)];
				} else {
					return [colKey, filterItemKeys(itemKeys, action.item.key)];
				}
			});
		case RECEIVE_UPDATE_MULTIPLE_ITEMS: {
			const changes = action.multiPatch
				.filter(patch => 'collections' in patch)
				.map(patch => [patch.key, patch.collections]);
			return mapObject(state, (colKey, itemKeys) => {
				for (let [modifiedItemKey, newCollections] of changes) {
					if(newCollections.includes(colKey)) {
						itemKeys = injectExtraItemKeys(
							meta.mappings,
							itemKeys,
							modifiedItemKey,
							{ ...items, [modifiedItemKey]: action.items.find(i => i.key === modifiedItemKey) }
						);
					} else {
						itemKeys = filterItemKeys(itemKeys, modifiedItemKey);
					}
				}
				return [colKey, itemKeys];
			});
		}
		case SORT_ITEMS:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = sortItemKeysOrClear(
					meta.mappings, itemKeys, action.items, action.sortBy, action.sortDirection
				);
				return aggr
			}, {});
		case RECEIVE_FETCH_ITEMS:
			return detectChangesInMembership(meta.mappings, state, action, items);
		default:
			return state;
	}
};

export default itemsByCollection;

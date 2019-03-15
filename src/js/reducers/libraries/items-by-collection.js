'use strict';

const { indexByKey } = require('../../utils');
const { populateItemKeys, filterItemKeys, sortItemKeysOrClear,
	injectExtraItemKeys } = require('../../common/reducers');
const {
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
	REQUEST_ITEMS_IN_COLLECTION,
	SORT_ITEMS,
} = require('../../constants/actions.js');

const itemsByCollection = (state = {}, action) => {
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
					action.itemKeys.filter(iKey =>
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
		case ERROR_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: {
					...state[action.collectionKey],
					isFetching: action.type === REQUEST_ITEMS_IN_COLLECTION,
					isError: action.type === ERROR_ITEMS_IN_COLLECTION
				}
			}
		case RECEIVE_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: populateItemKeys(
					state[action.collectionKey] || {},
					action.items.map(item => item.key),
					action
				)
			};
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
		case SORT_ITEMS:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = sortItemKeysOrClear(
					itemKeys, action.items, action.sortBy, action.sortDirection
				);
				return aggr
			}, {});
		default:
			return state;
	}
};

module.exports = itemsByCollection;

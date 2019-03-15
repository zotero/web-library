'use strict';
const { populateItemKeys, filterItemKeys, sortItemKeysOrClear,
	injectExtraItemKeys } = require('../../common/reducers');
const { indexByKey, get } = require('../../utils');

const {
	ERROR_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_TOP_ITEMS,
	RECEIVE_TRASH_ITEMS,
	REQUEST_CHILD_ITEMS,
	SORT_ITEMS,
} = require('../../constants/actions.js');

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
		case RECEIVE_CREATE_ITEMS:
			var otherItems = { ...action.otherItems, ...indexByKey(action.items) };
			return {
				...state,
				...(action.items.reduce((aggr, item) => {
					parentKey = get(action, 'item.parentItem');
					if(parentKey) {
						//@TODO: Optimise (inject loops over all items of the first argument)
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
		case SORT_ITEMS:
			return Object.entries(state).reduce((aggr, [parentKey, itemKeys]) => {
				aggr[parentKey] = sortItemKeysOrClear(
					itemKeys, action.items, action.sortBy, action.sortDirection
				);
				return aggr
			}, {});
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
		default:
			return state;
	}
};

module.exports = itemsByParent;

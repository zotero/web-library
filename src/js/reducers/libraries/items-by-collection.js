'use strict';

const { populate, inject } = require('../../common/reducers');
const {
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
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
						aggr[collectionKey] = inject(
							state[collectionKey] || [],
							[action.item.key]
						)
						return aggr;
					}, {}))
			}
		case RECEIVE_CREATE_ITEMS:
			return {
				...state,
				...(action.items.reduce((aggr, item) => {
					item.collections.forEach(
						collectionKey => {
							//@TODO: Optimise (inject loops over all items of the first argument)
							if(collectionKey in aggr) {
								aggr[collectionKey] = inject(
									aggr[collectionKey], item.key
								);
							} else if(collectionKey in state) {
								aggr[collectionKey] = inject(
									state[collectionKey], item.key
								);
							}
					});
					return aggr;
				}, {}))
			};
		case RECEIVE_DELETE_ITEM:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = itemKeys.filter(k => k !== action.item.key)
				return aggr;
			}, {});
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = itemKeys.filter(k => !action.itemKeys.includes(k))
				return aggr;
			}, {});
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = inject(
					itemKeys,
					action.itemKeysByCollection[collectionKey] || []
				);
				return aggr;
			}, {});
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
			return {
				...state,
				[action.collectionKey]: inject(
					state[action.collectionKey] || [],
					action.itemKeys.filter(iKey =>
						action.items.find(item => item.key === iKey && !item.deleted)
					)
				)
			}
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
			return {
				...state,
				[action.collectionKey]: (state[action.collectionKey] || [])
					.filter(itemKey => !action.itemKeysChanged.includes(itemKey))
			}
		case RECEIVE_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: populate(
					state[action.collectionKey] || [],
					action.items.map(item => item.key), action.start,
					action.limit, action.totalResults
				)
			};
		case SORT_ITEMS:
			return Object.entries(state).reduce((aggr, [collectionKey, itemKeys]) => {
				aggr[collectionKey] = new Array(itemKeys.length);
				return aggr
			}, {});
		default:
			return state;
	}
};

module.exports = itemsByCollection;

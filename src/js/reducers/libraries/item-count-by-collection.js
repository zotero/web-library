'use strict';

const {
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_CREATE_ITEM,
} = require('../../constants/actions');

const itemCountByCollection = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				...(action.item.collections.reduce(
					(aggr, collectionKey) => {
						if(collectionKey in state) {
							aggr[collectionKey] = state[collectionKey] + 1;
						}
						return aggr;
					}, {}))
			};
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...(action.response.getData().reduce((aggr, collection, index) => {
					aggr[collection.key] = action.response.getMeta()[index].numItems;
					return aggr;
				}, {}))
			};
		case RECEIVE_ITEMS_IN_COLLECTION:
			return {
				...state,
				[action.collectionKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		case RECEIVE_MOVE_ITEMS_TRASH:
			return {
				...state,
				...Object.entries(action.itemKeysByCollection).reduce(
					(aggr, [collectionKey, itemKeys]) => {
						if(!(collectionKey in state)) { return aggr; }
						aggr[collectionKey] = state[collectionKey] - itemKeys.length
						return aggr;
				}, {})
			}
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return {
				...state,
				...Object.entries(action.itemKeysByCollection).reduce(
					(aggr, [collectionKey, itemKeys]) => {
						if(!(collectionKey in state)) { return aggr; }
						aggr[collectionKey] = state[collectionKey] + itemKeys.length;
						return aggr;
				}, {})
			}
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
			if(!(action.collectionKey in state)) { return state; }
			return {
				...state,
				[action.collectionKey]: state[action.collectionKey] + action.itemKeysChanged.length
			}
		default:
			return state;
	}
};

module.exports = itemCountByCollection;

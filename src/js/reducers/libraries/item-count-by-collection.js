'use strict';

const {
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
} = require('../../constants/actions');

const itemCountByCollection = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...(action.response.getData().reduce((aggr, collection, index) => {
					aggr[collection.key] = action.response.getMeta()[index].numItems;
					return aggr;
				}, {}))
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
				[action.collectionKey]: state[action.collectionKey] + action.itemKeys.length
			}
		default:
			return state;
	}
};

module.exports = itemCountByCollection;

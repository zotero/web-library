'use strict';

const {
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
						aggr[collectionKey] = Math.max(
							(state[collectionKey] || 0) - itemKeys.length, 0
						)
						return aggr;
				}, {})
			}
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return {
				...state,
				...Object.entries(action.itemKeysByCollection).reduce(
					(aggr, [collectionKey, itemKeys]) => {
						aggr[collectionKey] = (state[collectionKey] || 0) + itemKeys.length
						return aggr;
				}, {})
			}
		default:
			return state;
	}
};

module.exports = itemCountByCollection;

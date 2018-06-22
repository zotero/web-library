'use strict';

const { RECEIVE_COLLECTIONS_IN_LIBRARY } = require('../../constants/actions');

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
		default:
			return state;
	}
};

module.exports = itemCountByCollection;

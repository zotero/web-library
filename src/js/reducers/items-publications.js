'use strict';

const { populateItemKeys, sortItemKeysOrClear } = require('../common/reducers');

const {
	RECEIVE_PUBLICATIONS_ITEMS,
	SORT_ITEMS,
} = require('../constants/actions.js');

const itemsPublications = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_PUBLICATIONS_ITEMS:
			return populateItemKeys(
				state,
				action.items.map(item => item.key),
				action
			);
		case SORT_ITEMS:
			return sortItemKeysOrClear(state, action.items, action.sortBy, action.sortDirection);
		default:
			return state;
	}
};

module.exports = itemsPublications;

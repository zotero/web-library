'use strict';

const { populate } = require('../common/reducers');

const {
	RECEIVE_PUBLICATIONS_ITEMS,
	SORT_ITEMS,
} = require('../constants/actions.js');

const itemsPublications = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_PUBLICATIONS_ITEMS:
			return populate(state, action.items.map(item => item.key));
		case SORT_ITEMS:
			return new Array(state.length);
		default:
			return state;
	}
};

module.exports = itemsPublications;

'use strict';

const {
	RECEIVE_PUBLICATIONS_ITEMS,
} = require('../constants/actions.js');

const itemsPublications = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_PUBLICATIONS_ITEMS:
			return [
				...(new Set([
					...state,
					...action.items.map(item => item.key)
				]))
			];
		default:
			return state;
	}
};

module.exports = itemsPublications;

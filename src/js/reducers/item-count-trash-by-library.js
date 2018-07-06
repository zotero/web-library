'use strict';

const { RECEIVE_TRASH_ITEMS } = require('../constants/actions');

const itemCountTrashByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TRASH_ITEMS:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		default:
			return state;
	}
};

module.exports = itemCountTrashByLibrary;

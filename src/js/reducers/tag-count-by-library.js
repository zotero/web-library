'use strict';

const {
	RECEIVE_TAGS_IN_LIBRARY,
} = require('../constants/actions.js');

const tagCountByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TAGS_IN_LIBRARY:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		default:
			return state;
	}
};

module.exports = tagCountByLibrary;

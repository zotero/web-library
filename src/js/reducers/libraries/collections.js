'use strict';

const { RECEIVE_COLLECTIONS_IN_LIBRARY } = require('../../constants/actions.js');
const { indexByKey } = require('../../utils');

const collections = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...indexByKey(action.collections, 'key')
			};
		default:
			return state;
	}
};

module.exports = collections;

'use strict';

const { get, indexByKey } = require('../../utils');
const {
	RECEIVE_LIBRARY_SETTINGS,
} = require('../../constants/actions');

const tags = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return {
				...state,
				...indexByKey(get(action.settings, 'tagColors.value', []), 'name')
			};
		default:
			return state;
	}
};

module.exports = tags;

'use strict';

const { get } = require('../../utils');
const {
	RECEIVE_LIBRARY_SETTINGS,
} = require('../../constants/actions');

const tags = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return get(action.settings, 'tagColors.value', []).map(({ name }) => name);
		default:
			return state;
	}
};

module.exports = tags;

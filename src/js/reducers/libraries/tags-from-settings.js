'use strict';

const { get } = require('../../utils');
const {
	RECEIVE_LIBRARY_SETTINGS,
} = require('../../constants/actions');

const tagsFromSettings = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return get(action.settings, 'tagColors.value', []).map(({ name }) => `${name}-0`);
		default:
			return state;
	}
};

module.exports = tagsFromSettings;

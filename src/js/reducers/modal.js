'use strict';

const { TOGGLE_MODAL } = require('../constants/actions.js');


const modal = (state = null, action) => {
	if(action.type == TOGGLE_MODAL && action.shouldOpen) {
		return action.id;
	}
	if(action.type == TOGGLE_MODAL && !action.shouldOpen) {
		return null;
	}

	return state;
};

module.exports = modal;

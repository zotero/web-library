'use strict';

const { TOGGLE_MODAL } = require('../constants/actions');
const { omit } = require('../common/immutable');


const modal = (state = { id: null }, action) => {
	if(action.type == TOGGLE_MODAL && action.shouldOpen) {
		return {
			...omit(action, 'type')
		}
	}
	if(action.type == TOGGLE_MODAL && !action.shouldOpen) {
		return {
			id: null
		};
	}

	return state;
};

module.exports = modal;

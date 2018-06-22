'use strict';

const { TRIGGER_RESIZE_VIEWPORT } = require('../constants/actions.js');

const defaultState = {
	width: 0, height: 0, xs: false, sm: false, md: false, lg: false,
};

const viewport = (state = defaultState, action) => {
	switch(action.type) {
		case TRIGGER_RESIZE_VIEWPORT:
			return {
				width: action.width,
				height: action.height,
				xs: action.width < 480,
				sm: action.width < 768 && action.width > 480,
				md: action.width < 992 && action.width > 768,
				lg: action.width > 992
			};
		default:
			return state;
	}
};

module.exports = viewport;

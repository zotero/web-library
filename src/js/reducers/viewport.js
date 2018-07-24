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
				xxs: action.width < 480,
				xs: action.width >= 480 && action.width < 768,
				sm: action.width >= 768 && action.width < 992,
				md: action.width >= 992 && action.width < 1200,
				lg: action.width >= 1200
			};
		default:
			return state;
	}
};

module.exports = viewport;

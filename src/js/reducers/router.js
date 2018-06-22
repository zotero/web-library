'use strict';

const { ROUTE_CHANGE } = require('../constants/actions.js');

const router = (state = {
	params: {}
}, action) => {
	switch(action.type) {
		case ROUTE_CHANGE:
			return {
				...state,
				params: action.params
			};
		default:
			return state;
	}
};

module.exports = router;

'use strict';

import { RECEIVE_GROUPS } from '../constants/actions.js';

const version = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_GROUPS:
			return action.groups;
		default:
			return state;
	}
};

export default version;

'use strict';

import { TOGGLE_MODAL } from '../constants/actions';
import { omit } from '../common/immutable';


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

export default modal;

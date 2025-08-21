import { omit } from 'web-common/utils';

import { TOGGLE_MODAL } from '../constants/actions';


const modal = (state = { id: null }, action) => {
	if(action.type == TOGGLE_MODAL && action.shouldOpen) {
		return {
			...omit(action, 'type')
		}
	}
	if(action.type == TOGGLE_MODAL && !action.shouldOpen) {
		return {
			...omit(action, 'type'), // let modals persist config/data while closing to avoid content disappearing during animation.
			id: null,
		};
	}

	return state;
};

export default modal;

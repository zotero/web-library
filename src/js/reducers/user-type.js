'use strict';

import { TRIGGER_USER_TYPE_CHANGE } from '../constants/actions.js';
import { getScrollbarWidth } from '../utils';
import { pick } from '../common/immutable';

const defaultState = {
	isKeyboardUser: null,
	isMouseUser: typeof(matchMedia) === 'function'
		? matchMedia('(pointer:fine)').matches : null,
	isTouchUser: typeof(matchMedia) === 'function'
		? matchMedia('(pointer:coarse)').matches : null,
	userType: matchMedia('(pointer:coarse)').matches ? 'touch' : null,
	scrollbarWidth: getScrollbarWidth()
};

const userType = (state = defaultState, action) => {
	switch(action.type) {
		case TRIGGER_USER_TYPE_CHANGE:
			return {
				...state,
				...pick(action, ['isKeyboardUser', 'isMouseUser', 'isTouchUser', 'userType', 'scrollbarWidth'])
			}
		default:
			return state;
	}
};

export default userType;

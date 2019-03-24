'use strict';

import {
    ERROR_DELETE_ITEM,
    ERROR_DELETE_ITEMS,
    RECEIVE_DELETE_ITEM,
    RECEIVE_DELETE_ITEMS,
    REQUEST_DELETE_ITEM,
    REQUEST_DELETE_ITEMS,
} from '../../constants/actions';

const deleting = (state = [], action) => {
	switch(action.type) {
		case REQUEST_DELETE_ITEM:
			return [...state, action.item.key];
		case REQUEST_DELETE_ITEMS:
			return [
					...state,
					...action.itemKeys
				];
		case RECEIVE_DELETE_ITEM:
		case ERROR_DELETE_ITEM:
			return state.filter(key => key !== action.item.key);
		case RECEIVE_DELETE_ITEMS:
		case ERROR_DELETE_ITEMS:
			return state.filter(key => !action.itemKeys.includes(key));
		default:
			return state;
	}
};

export default deleting;

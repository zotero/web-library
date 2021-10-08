import {
	REQUEST_RELATED_ITEMS, RECEIVE_RELATED_ITEMS, ERROR_RELATED_ITEMS,
} from '../../constants/actions.js';

const itemsRelated = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_RELATED_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					isFetching: true,
					isFetched: false
				}
			};
		case RECEIVE_RELATED_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					isFetching: false,
					isFetched: true
				}
			};
		case ERROR_RELATED_ITEMS:
			return {
				...state,
				[action.itemKey]: {
					isFetching: false,
					isFetched: false
				}
			};
		default:
			return state;
	}
};

export default itemsRelated;

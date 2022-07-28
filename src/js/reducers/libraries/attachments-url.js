import {
	REQUEST_ATTACHMENT_URL, RECEIVE_ATTACHMENT_URL, ERROR_ATTACHMENT_URL
} from '../../constants/actions';

const settings = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_ATTACHMENT_URL:
			return {
				...state,
				[action.itemKey]: {
					isFetching: true,
					promise: action.promise
				}
			}
		case RECEIVE_ATTACHMENT_URL:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					timestamp: Date.now(),
					isFetching: false,
					url: action.url,
				}
			}
		case ERROR_ATTACHMENT_URL:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					isFetching: false,
				}
			}
		default:
			return state;
	}
};

export default settings;

import { ERROR_ATTACHMENT_URL, ERROR_UPLOAD_ATTACHMENT, RECEIVE_ATTACHMENT_URL,
	RECEIVE_UPLOAD_ATTACHMENT, REQUEST_ATTACHMENT_URL, REQUEST_UPLOAD_ATTACHMENT
} from '../../constants/actions';
import { omit } from 'web-common/utils';

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
		case REQUEST_UPLOAD_ATTACHMENT:
			return {
				...state,
				[action.itemKey]: {
					...(state[action.itemKey] || {}),
					isUploading: true,
				}
			}
		case RECEIVE_UPLOAD_ATTACHMENT:
		case ERROR_UPLOAD_ATTACHMENT:
			return omit(state, action.itemKey);
		default:
			return state;
	}
};

export default settings;

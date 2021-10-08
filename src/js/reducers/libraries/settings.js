import {
	RECEIVE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const settings = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return action.settings;
		default:
			return state;
	}
};

export default settings;

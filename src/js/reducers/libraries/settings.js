import { omit } from 'web-common/utils';

import {
	RECEIVE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS, RECEIVE_DELETE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const settings = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return action.settings;
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return {
				...state,
				[action.settingsKey]: {
					...action.settingsValue,
					version: action.response.getVersion()
				}
			}
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return omit(state, action.settingsKey)
		default:
			return state;
	}
};

export default settings;

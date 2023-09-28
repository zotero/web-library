import { indexByKey } from '../../utils';

import {
	RECEIVE_DELETE_LIBRARY_SETTINGS, RECEIVE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const tagColors = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return action.settingsKey === 'tagColors' ? {
				value: action.value ?? [],
				lookup: indexByKey(action.value ?? [], 'name', ({ color }) => color)
			} : state;
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return { value: [], lookup: {} };
		default:
			return state;
	}
};

export default tagColors;

import { get, indexByKey } from '../../utils';

import {
	RECEIVE_DELETE_LIBRARY_SETTINGS, RECEIVE_LIBRARY_SETTINGS, RECEIVE_UPDATE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const tagColors = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return {
				value: get(action.settings, 'tagColors.value', []),
				lookup: indexByKey(
					get(action.settings, 'tagColors.value', []),
					'name',
					({ color }) => color
				)
			};
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return action.settingsKey === 'tagColors' ? {
				value: action.settingsValue.value,
				lookup: indexByKey( action.settingsValue.value, 'name', ({ color }) => color)
			} : state;
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
			return { value: [], lookup: {} };
		default:
			return state;
	}
};

export default tagColors;

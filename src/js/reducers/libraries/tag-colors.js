import { get, indexByKey } from '../../utils';

import {
    RECEIVE_LIBRARY_SETTINGS,
    RECEIVE_UPDATE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const tagColors = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
			return {
				value: get(action.settings, 'tagColors.value', []),
				lookup: indexByKey(
					get(action.settings, 'tagColors.value', []),
					'name',
					({ color }) => color
				)
			};
		default:
			return state;
	}
};

export default tagColors;

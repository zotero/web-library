import { get, indexByKey } from '../../utils';

import {
    RECEIVE_LIBRARY_SETTINGS,
} from '../../constants/actions';

const tagColors = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return {
				...indexByKey(
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

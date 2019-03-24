'use strict';

import { get } from '../../utils';
import { RECEIVE_LIBRARY_SETTINGS } from '../../constants/actions';

const tagsFromSettings = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_LIBRARY_SETTINGS:
			return get(action.settings, 'tagColors.value', []).map(({ name }) => `${name}-0`);
		default:
			return state;
	}
};

export default tagsFromSettings;

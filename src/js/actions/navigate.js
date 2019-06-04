'use strict';

import { makePath } from '../common/navigation';
import { push } from 'connected-react-router';

const navigate = path => {
	return async (dispatch, getState) => {
		const state = getState();
		const configuredPath = makePath(state.config, path);
		dispatch(push(configuredPath));
	}
};

export { navigate };

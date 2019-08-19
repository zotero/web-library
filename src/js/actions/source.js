import {
	REQUEST_SOURCE,
	RECEIVE_SOURCE,
	ERROR_SOURCE,
} from '../constants/actions';

import { loadJs } from '../utils';

const getFilePath = (name, state) => {
	switch(name) {
		case 'tinymce':
			return (state.config.tinymceRoot || '/') + 'tinymce.min.js';
		default:
			return name;
	}
}

const sourceFile = name => {
	return async (dispatch, getState) => {
		const path = getFilePath(name, getState());
		dispatch({
			type: REQUEST_SOURCE,
			name, path
		});
		try {
			await loadJs(path);
			dispatch({
				type: RECEIVE_SOURCE,
				name, path
			});
		} catch(error) {
			dispatch({
				type: ERROR_SOURCE,
				name,
				path,
				error
			});
		}
	}
}

export { sourceFile }

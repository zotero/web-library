'use strict';

import { REQUEST_FETCH_STYLES, RECEIVE_FETCH_STYLES, ERROR_FETCH_STYLES } from '../constants/actions.js';
const defaultState = { isFetching: false , stylesData: null }

const styles = (state = defaultState, action) => {
	switch(action.type) {
		case REQUEST_FETCH_STYLES:
			return { ...state, isFetching: true };
		case RECEIVE_FETCH_STYLES:
			return {
				isFetching: false,
				stylesData: action.stylesData,
			};
		case ERROR_FETCH_STYLES:
			return { ...state, isFetching: false }
		default:
			return state;
	}
};

export default styles;

import {
    ERROR_SOURCE,
    RECEIVE_SOURCE,
    REQUEST_SOURCE,
} from '../constants/actions.js';

const sources = ( state = { fetching: [], fetched: [] }, action) => {
	switch(action.type) {
		case REQUEST_SOURCE:
			return {
				...state,
				fetching: [...state.fetching, action.name]
			}
		case RECEIVE_SOURCE:
			return {
				...state,
				fetched: [...state.fetched, action.name],
				fetching: state.fetching.filter(p => p != action.name)
			}
		case ERROR_SOURCE:
			return {
				...state,
				fetching: state.fetching.filter(p => p != action.name)
			}
	}

	return state;
};

export default sources;

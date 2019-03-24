'use strict';

import {
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    RECEIVE_CREATE_COLLECTION,
    RECEIVE_DELETE_COLLECTION,
} from '../constants/actions';

const itemCountTopByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_COLLECTION:
			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] + 1
			}
		case RECEIVE_DELETE_COLLECTION:
			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] - 1
			}
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		default:
			return state;
	}
};

export default itemCountTopByLibrary;

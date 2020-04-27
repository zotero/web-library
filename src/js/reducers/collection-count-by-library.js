'use strict';

import {
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    RECEIVE_CREATE_COLLECTIONS,
    RECEIVE_DELETE_COLLECTION,
} from '../constants/actions';

const collectionCountByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_COLLECTIONS:
			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] + action.collections.length
			}
		case RECEIVE_DELETE_COLLECTION:
			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] - 1
			}
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			if('since' in action) {
				// ignore requests for partial updates
				return state;
			}
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		default:
			return state;
	}
};

export default collectionCountByLibrary;

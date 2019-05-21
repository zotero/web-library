'use strict';

import {
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    RECEIVE_CREATE_COLLECTIONS,
    RECEIVE_DELETE_COLLECTION,
    RECEIVE_UPDATE_COLLECTION,
} from '../../constants/actions.js';

import { indexByKey } from '../../utils';
import { removeKeys } from '../../common/immutable';

const collections = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_UPDATE_COLLECTION:
			return {
				...state,
				[action.collection.key]: action.collection
			}
		case RECEIVE_CREATE_COLLECTIONS:
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...indexByKey(action.collections, 'key')
			};
		case RECEIVE_DELETE_COLLECTION:
			return removeKeys(state, action.collection.key);
		default:
			return state;
	}
};

export default collections;

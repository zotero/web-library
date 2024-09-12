import { omit } from 'web-common/utils';

import {
	BEGIN_FETCH_ALL_COLLECTIONS, BEGIN_FETCH_COLLECTIONS_SINCE, COMPLETE_FETCH_ALL_COLLECTIONS,
	COMPLETE_FETCH_COLLECTIONS_SINCE, ERROR_COLLECTIONS_IN_LIBRARY, RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_CREATE_COLLECTIONS, RECEIVE_DELETE_COLLECTION, RECEIVE_DELETE_COLLECTIONS, RECEIVE_DELETED_CONTENT,
	REQUEST_COLLECTIONS_IN_LIBRARY,
} from '../../constants/actions.js';

const defaultState = {
	keys: [],
	remoteChangesTracker: {},
}

const countNewCollections = (action, state) => {
	if(!('totalResults' in state)) {
		// haven't checked collections in this library yet, ignore
		return 0;
	}

	const count = action.collections
		.filter(collection => !(collection.key in state.keys))
		.length;
	return count;
}

const collections = (state = defaultState, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_COLLECTIONS:
			return {
				...state,
				keys: [...new Set([...state.keys, ...action.collections.map(c => c.key)])],
				totalResults: state.totalResults + action.collections.length
			};
		case REQUEST_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				isFetching: true,
			}
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				keys: [...new Set([...state.keys, ...action.collections.map(c => c.key)])],
				isFetching: false,
				totalResults: 'since' in action ?
					(state.totalResults || 0) + countNewCollections(action, state) :
					action.totalResults,
				remoteChangesTracker: 'since' in action ? {
					...state.remoteChangesTracker,
					[action.since]: action.totalResults
				} : { ...state.remoteChangesTracker }
			};
		case ERROR_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				isFetching: false,
			}
		case RECEIVE_DELETE_COLLECTION:
			return {
				...state,
				keys: state.keys.filter(key => key !== action.collection.key),
				totalResults: state.totalResults - 1
			}
		case RECEIVE_DELETED_CONTENT:
		case RECEIVE_DELETE_COLLECTIONS: {
			const keys = state.keys.filter(key => !action.collectionKeys.includes(key));
			return {
				...state,
				keys,
				totalResults: keys.length
			}
		}
		case BEGIN_FETCH_ALL_COLLECTIONS:
			return {
				...state,
				isFetchingAll: true
			}
		case COMPLETE_FETCH_ALL_COLLECTIONS:
			return {
				...state,
				isFetchingAll: false
			}
		case BEGIN_FETCH_COLLECTIONS_SINCE:
			return {
				...state,
				remoteChangesTracker: {
					...state.remoteChangesTracker,
					[action.since]: null,
				}
			}
		case COMPLETE_FETCH_COLLECTIONS_SINCE:
			return {
				...state,
				remoteChangesTracker: {
					...omit(state.remoteChangesTracker, action.since)
				}
			}
		default:
			return state;
	}
};

export default collections;

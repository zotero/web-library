import {
	BEGIN_FETCH_ALL_COLLECTIONS,
	BEGIN_FETCH_COLLECTIONS_SINCE,
	COMPLETE_FETCH_ALL_COLLECTIONS,
	COMPLETE_FETCH_COLLECTIONS_SINCE,
	ERROR_COLLECTIONS_IN_LIBRARY,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_CREATE_COLLECTIONS,
	RECEIVE_DELETE_COLLECTION,
	RECEIVE_DELETED_CONTENT,
	RECEIVE_UPDATE_COLLECTION,
	REQUEST_COLLECTIONS_IN_LIBRARY,
} from '../../constants/actions.js';

import { indexByKey } from '../../utils';
import { omit } from '../../common/immutable';

const defaultState = {
	data: {},
	remoteChangesTracker: {},
}

const countNewCollections = (action, state) => {
	if(!('totalResults' in state)) {
		// haven't checked collections in this library yet, ignore
		return 0;
	}

	const count = action.collections
		.filter(collection => !(collection.key in state.data))
		.length;
	return count;
}

const countRemovedCollections = (action, state) => {
	if(!('totalResults' in state)) {
		// haven't checked collections in this library yet, ignore
		return 0;
	}

	const count = action.collectionKeys
		.filter(collectionKey => (collectionKey in state.data))
		.length;
	return count;
}

const collections = (state = defaultState, action) => {
	switch(action.type) {
		case RECEIVE_UPDATE_COLLECTION:
			return {
				...state,
				data: {
					...state.data,
					[action.collection.key]: action.collection
				}
			}
		case RECEIVE_CREATE_COLLECTIONS:
			return {
				...state,
				data: {
					...state.data,
					...indexByKey(action.collections, 'key')
				},
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
				data: {
					...state.data,
					...indexByKey(action.collections, 'key')
				},
				isFetching: false,
				totalResults: 'since' in action ?
					(state.totalResults || 0) + countNewCollections(action, state.data) :
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
				data: omit(state.data, action.collection.key),
				totalResults: state.totalResults - 1
			}
		case RECEIVE_DELETED_CONTENT:
			return {
				...state,
				data: omit(state.data, action.collectionKeys),
				totalResults: (state.totalResults || 0) - countRemovedCollections(action, state)
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

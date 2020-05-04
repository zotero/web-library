import {
    RECEIVE_COLLECTIONS_IN_LIBRARY,
    RECEIVE_CREATE_COLLECTIONS,
    RECEIVE_DELETE_COLLECTION,
    RECEIVE_DELETED_CONTENT,
} from '../constants/actions';

const countNewCollections = (action, libraries) => {
	var count = 0;

	if(action.libraryKey in libraries) {
		action.collections.forEach(collection => {
			if(!(collection.key in libraries[action.libraryKey].collections)) {
				count++;
			}
		});
	}
	console.log(`countNewCollections: ${count}`);
	return count;
}

const countRemovedCollections = (action, libraries) => {
	var count = 0;

	if(action.libraryKey in libraries) {
		action.collectionKeys.forEach(collectionKey => {
			if(collectionKey in libraries[action.libraryKey].collections) {
				count++;
			}
		})
	}

	console.log(`countRemovedCollections: ${count}`);
	return count;
}

const collectionCountByLibrary = (state = {}, action, { libraries } = {}) => {
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
				return {
					...state,
					[action.libraryKey]: (state[action.libraryKey] || 0) + countNewCollections(action, libraries)
				}
			}
			return {
				...state,
				[action.libraryKey]: parseInt(action.response.response.headers.get('Total-Results'), 10)
			};
		case RECEIVE_DELETED_CONTENT:
			if(!(action.libraryKey in state)) {
				return state;
			}

			return {
				...state,
				[action.libraryKey]: state[action.libraryKey] - countRemovedCollections(action, libraries)
			}
		default:
			return state;
	}
};

export default collectionCountByLibrary;

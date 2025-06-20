import { LOCATION_CHANGE } from 'connected-react-router';

import {
	REQUEST_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
	ERROR_ITEMS_BY_QUERY,
	DROP_ITEMS_BY_QUERY,
	SORT_ITEMS,
	REQUEST_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_TAGS_IN_ITEMS_BY_QUERY,
	ERROR_TAGS_IN_ITEMS_BY_QUERY,
	DROP_TAGS_IN_ITEMS_BY_QUERY,
	REQUEST_COLORED_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_COLORED_TAGS_IN_ITEMS_BY_QUERY,
	ERROR_COLORED_TAGS_IN_ITEMS_BY_QUERY,
	DROP_COLORED_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_DELETE_TAGS,
	RESET_QUERY,
	RECEIVE_LIBRARY_SETTINGS,
	RECEIVE_UPDATE_LIBRARY_SETTINGS,
	RECEIVE_DELETE_LIBRARY_SETTINGS,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_CREATE_COLLECTIONS,
	RECEIVE_DELETE_COLLECTION,
	RECEIVE_DELETE_COLLECTIONS,
	RECEIVE_UPDATE_COLLECTIONS_TRASH,
	RECEIVE_ITEMS_SECONDARY,
} from '../constants/actions.js';
import { injectTrashedCollections } from '../common/reducers';


const defaultState = {
	current: {},
	isFetching: false,
	keys: [],
	requests: [],
	tags: {},
	totalResults: null,
};

// This is a secondary reducer that receives NEXT state so we can produce items + collections combined
const queryAndCollectionsTrash = (state = defaultState, action, nextState) => {
	if(!nextState) {
		return state;
	}

	if (!nextState.current?.isTrash) {
		// We only care about trash queries where trashed collections should be injected
		return nextState.query;
	}

	const { current, config, meta, query: queryState } = nextState;
	const { libraryKey } = current;
	const collectionsState = nextState.libraries[libraryKey]?.collections;
	const dataObjectsState = nextState.libraries[libraryKey]?.dataObjects;

	if(!collectionsState || !dataObjectsState) {
		return state;
	}

	switch (action.type) {
		case LOCATION_CHANGE:
		case REQUEST_ITEMS_BY_QUERY:
		case RECEIVE_ITEMS_BY_QUERY:
		case ERROR_ITEMS_BY_QUERY:
		case DROP_ITEMS_BY_QUERY:
		case REQUEST_TAGS_IN_ITEMS_BY_QUERY:
		case RECEIVE_TAGS_IN_ITEMS_BY_QUERY:
		case ERROR_TAGS_IN_ITEMS_BY_QUERY:
		case DROP_TAGS_IN_ITEMS_BY_QUERY:
		case REQUEST_COLORED_TAGS_IN_ITEMS_BY_QUERY:
		case RECEIVE_COLORED_TAGS_IN_ITEMS_BY_QUERY:
		case ERROR_COLORED_TAGS_IN_ITEMS_BY_QUERY:
		case DROP_COLORED_TAGS_IN_ITEMS_BY_QUERY:
		case RECEIVE_UPDATE_ITEM:
		case RECEIVE_DELETE_ITEM:
		case RECEIVE_DELETE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
		case RECEIVE_ADD_TAGS_TO_ITEMS:
		case RECEIVE_DELETE_TAGS:
		case RESET_QUERY:
		case RECEIVE_LIBRARY_SETTINGS:
		case RECEIVE_UPDATE_LIBRARY_SETTINGS:
		case RECEIVE_DELETE_LIBRARY_SETTINGS:
		case SORT_ITEMS:
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		case RECEIVE_CREATE_COLLECTIONS:
		case RECEIVE_DELETE_COLLECTION:
		case RECEIVE_DELETE_COLLECTIONS:
		case RECEIVE_UPDATE_COLLECTIONS_TRASH:
		case RECEIVE_ITEMS_SECONDARY:
			return {
				...state,
				...injectTrashedCollections(queryState, collectionsState, dataObjectsState, meta, config)
			}
		default:
			return state;
	}
}

export default queryAndCollectionsTrash;

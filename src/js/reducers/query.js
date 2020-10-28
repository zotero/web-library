import deepEqual from 'deep-equal';
import { shallowEqual } from 'react-redux';
import { LOCATION_CHANGE } from 'connected-react-router'

import { ERROR_ITEMS_BY_QUERY, ERROR_TAGS_IN_ITEMS_BY_QUERY, RECEIVE_COLORED_TAGS_IN_ITEMS_BY_QUERY,
RECEIVE_DELETE_ITEM, RECEIVE_DELETE_ITEMS, RECEIVE_ITEMS_BY_QUERY, RECEIVE_MOVE_ITEMS_TRASH,
RECEIVE_RECOVER_ITEMS_TRASH, RECEIVE_REMOVE_ITEMS_FROM_COLLECTION, RECEIVE_TAGS_IN_ITEMS_BY_QUERY,
RECEIVE_UPDATE_ITEM, REQUEST_ITEMS_BY_QUERY, REQUEST_TAGS_IN_ITEMS_BY_QUERY, SORT_ITEMS,
RESET_QUERY, DROP_TAGS_IN_ITEMS_BY_QUERY, DROP_ITEMS_BY_QUERY,
REQUEST_COLORED_TAGS_IN_ITEMS_BY_QUERY, ERROR_COLORED_TAGS_IN_ITEMS_BY_QUERY,
DROP_COLORED_TAGS_IN_ITEMS_BY_QUERY, } from '../constants/actions.js';

import { getParamsFromRoute } from '../common/state';
import { getQueryFromParams } from '../common/navigation';
import { filterItemKeys, populateTags, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../common/reducers';
import { get } from '../utils';

const isMatchingQuery = (action, state) => {
	const { q = '', qmode, tag = [] } = action.queryOptions;

	return q === state.current.q &&
		state.current.qmode === qmode &&
		shallowEqual(tag, state.current.tag);
}

const defaultState = {
	current: {},
	isFetching: false,
	itemKeys: [],
	requests: [],
	tags: {},
	totalResults: null,
};

const query = (state = defaultState, action, otherState) => {
	const isTrash = get(otherState, 'current.isTrash');
	const collectionKey = get(otherState, 'current.collectionKey');
	switch(action.type) {
		case LOCATION_CHANGE:
			var params = getParamsFromRoute({ router: { ...action.payload } });
			var query = getQueryFromParams(params);
			var isChanged = !deepEqual(query, state.current);
			return {
				...state,
				current: query,
				totalResults: isChanged ? undefined : state.totalResults,
				keys: isChanged ? [] : state.keys,
				isFetching: false,
				tags: isChanged ? {} : state.tags
			};
		case REQUEST_ITEMS_BY_QUERY:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_ITEMS_BY_QUERY:
			return {
				...(isMatchingQuery(action, state) ? populateItemKeys(state, action.items.map(item => item.key), action) : state),
				...updateFetchingState(state, action)
			}
		case ERROR_ITEMS_BY_QUERY:
		case DROP_ITEMS_BY_QUERY:
			return {
				...state,
				...updateFetchingState(state, action),
				isError: true
			}
		case SORT_ITEMS:
			return sortItemKeysOrClear(
				state, action.items, action.sortBy, action.sortDirection
			);
		case REQUEST_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					...updateFetchingState(state.tags, action),
				}
			}
		case RECEIVE_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					...populateTags(state.tags, action.tags, action),
					...updateFetchingState(state.tags, action),
				}
			};
		case ERROR_TAGS_IN_ITEMS_BY_QUERY:
		case DROP_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					...updateFetchingState(state.tags, action),
				}
			};
		case REQUEST_COLORED_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetchingColoredTags: true,
				}
			};
		case RECEIVE_COLORED_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					coloredTags: action.tags.map(t => t.tag),
					isFetchingColoredTags: false,
				}
			};
		case ERROR_COLORED_TAGS_IN_ITEMS_BY_QUERY:
		case DROP_COLORED_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetchingColoredTags: false,
				}
			};
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? { ...state, tags: {} } : state;
		case RECEIVE_DELETE_ITEM:
			return filterItemKeys(state, action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return filterItemKeys(state, action.itemKeys);
		case RECEIVE_MOVE_ITEMS_TRASH:
			return isTrash ? state : filterItemKeys(state, action.itemKeys);
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return isTrash ? filterItemKeys(state, action.itemKeys) : state;
		case RECEIVE_REMOVE_ITEMS_FROM_COLLECTION:
			return (collectionKey && collectionKey === action.collectionKey) ?
				filterItemKeys(state, action.itemKeysChanged) : state;
		case RESET_QUERY:
			return defaultState;
		default:
			return state;
	}
};

export default query;

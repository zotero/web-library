'use strict';

import { populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../common/reducers';
import deepEqual from 'deep-equal';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    REQUEST_ITEMS_BY_QUERY,
    RECEIVE_ITEMS_BY_QUERY,
    ERROR_ITEMS_BY_QUERY,
    SORT_ITEMS,
	REQUEST_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_TAGS_IN_ITEMS_BY_QUERY,
	ERROR_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_UPDATE_ITEM,
} from '../constants/actions.js';

import { getParamsFromRoute } from '../common/state';
import { getQueryFromParams } from '../common/navigation';
import { deduplicate } from '../utils';


const defaultState = {
	current: null,
	isFetching: false,
	itemKeys: [],
	requests: [],
	tags: {},
	totalResults: null,
};

const query = (state = defaultState, action) => {
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
				...populateItemKeys(state, action.items.map(item => item.key), action),
				...updateFetchingState(state, action)
			}
		case ERROR_ITEMS_BY_QUERY:
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
					pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
						&& !('tag' in action.queryOptions))
						? action.queryOptions.start + action.queryOptions.limit : state.pointer,
					totalResults: action.queryOptions.tag ? state.totalResults : action.totalResults,
					tags: deduplicate([...(state.tags.tags || []), ...action.tags.map(t => t.tag)]),
					...(action.queryOptions.tag ? {} : updateFetchingState(state.tags, action)),
				}
			};
		case ERROR_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					...updateFetchingState(state.tags, action),
				}
			};
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? {} : state;
		default:
			return state;
	}
};

export default query;

'use strict';

import deepEqual from 'deep-equal';
import { shallowEqual } from 'react-redux';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
	ERROR_ITEMS_BY_QUERY,
	ERROR_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_COLORED_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
	RECEIVE_TAGS_IN_ITEMS_BY_QUERY,
	RECEIVE_UPDATE_ITEM,
	REQUEST_ITEMS_BY_QUERY,
	REQUEST_TAGS_IN_ITEMS_BY_QUERY,
	SORT_ITEMS,
} from '../constants/actions.js';

import { getParamsFromRoute } from '../common/state';
import { getQueryFromParams } from '../common/navigation';
import { populateTags, populateItemKeys, sortItemKeysOrClear, updateFetchingState } from '../common/reducers';

const isMatchingQuery = (action, state) => {
	const { q, qmode, tag } = action.queryOptions;
	return state.current.q === q && state.current.qmode === qmode && shallowEqual(tag, state.current.tag);
}

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
				...(isMatchingQuery(action, state) ? populateItemKeys(state, action.items.map(item => item.key), action) : state),
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
					...populateTags(state.tags, action.tags, action),
					...updateFetchingState(state.tags, action),
				}
			};
		case RECEIVE_COLORED_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					coloredTags: action.tags.map(t => t.tag)
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

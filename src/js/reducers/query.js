'use strict';

import { populateItemKeys, sortItemKeysOrClear } from '../common/reducers';
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
} from '../constants/actions.js';

import { getParamsFromRoute } from '../common/state';
import { getQueryFromParams } from '../common/navigation';
import { deduplicateByHash } from '../utils';


const defaultState = {
	current: null,
	isFetching: false,
	itemKeys: [],
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
		case ERROR_ITEMS_BY_QUERY:
			return {
				...state,
				isFetching: action.type === REQUEST_ITEMS_BY_QUERY
			}
		case RECEIVE_ITEMS_BY_QUERY:
			return populateItemKeys(
				state,
				action.items.map(item => item.key),
				action
			);
		case SORT_ITEMS:
			return sortItemKeysOrClear(
				state, action.items, action.sortBy, action.sortDirection
			);
		case REQUEST_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetching: true
				}
			}
		case RECEIVE_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetching: false,
					pointer: ('start' in action.queryOptions && 'limit' in action.queryOptions
						&& !('tag' in action.queryOptions))
						? action.queryOptions.start + action.queryOptions.limit : state.pointer,
					totalResults: parseInt(
						action.response.response.headers.get('Total-Results'), 10
					),
					tags: deduplicateByHash([...(state.tags.tags || []), ...action.tags], t => t.tag + t.type),
				}
			};
		case ERROR_TAGS_IN_ITEMS_BY_QUERY:
			return {
				...state,
				tags: {
					...state.tags,
					isFetching: false
				}
			};
		default:
			return state;
	}
};

export default query;

'use strict';

import { populateItemKeys, sortItemKeysOrClear } from '../common/reducers';
import deepEqual from 'deep-equal';
import { LOCATION_CHANGE } from 'connected-react-router';

import {
    REQUEST_ITEMS_BY_QUERY,
    RECEIVE_ITEMS_BY_QUERY,
    ERROR_ITEMS_BY_QUERY,
    SORT_ITEMS,
} from '../constants/actions.js';

import { getParamsFromRoute } from '../common/state';
import { getQueryFromParams } from '../common/navigation';


const defaultState = {
	current: null,
	totalResults: null,
	itemKeys: [],
	isFetching: false,
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
				isFetching: false
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
		default:
			return state;
	}
};

export default query;

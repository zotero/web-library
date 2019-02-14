'use strict';

const { populateItemKeys, sortItemKeysOrClear } = require('../common/reducers');
const deepEqual = require('deep-equal');
const { LOCATION_CHANGE } = require('connected-react-router');
const {
	REQUEST_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
	ERROR_ITEMS_BY_QUERY,
	SORT_ITEMS
} = require('../constants/actions.js');
const { getParamsFromRoute } = require('../common/state');
const { getQueryFromParams } = require('../common/navigation');


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
				totalResults: isChanged ? null : state.totalResults,
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

module.exports = query;

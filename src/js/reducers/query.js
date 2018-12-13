'use strict';

const deepEqual = require('deep-equal');
const { LOCATION_CHANGE } = require('connected-react-router');
const {
	RECEIVE_ITEMS_BY_QUERY,
} = require('../constants/actions.js');
const { getParamsFromRoute } = require('../common/state');
const { getQueryFromParams } = require('../common/navigation');


const defaultState = {
	current: null,
	totalResults: null,
	itemKeys: []
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
				itemKeys: isChanged ? [] : state.itemKeys
			};
		case RECEIVE_ITEMS_BY_QUERY:
			return {
				...state,
				totalResults: parseInt(action.response.response.headers.get('Total-Results'), 10),
				itemKeys: [
					...(new Set([
						...state.itemKeys,
						...action.items.map(item => item.key)
					]))
				]
			}
		default:
			return state;
	}
};

module.exports = query;

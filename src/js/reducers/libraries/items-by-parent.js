'use strict';
const { populate, inject } = require('../../common/reducers');
const { get } = require('../../utils');
const {
	RECEIVE_CHILD_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	SORT_ITEMS,
} = require('../../constants/actions.js');

const itemsByParent = (state = {}, action) => {
	var parentKey;
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			parentKey = get(action, 'item.parentItem');
			if(parentKey && parentKey in state) {
				return {
					...state,
					[parentKey]: inject(state, action.item.key)
				};
			}
			return state;
		case RECEIVE_CREATE_ITEMS:
			return {
				...state,
				...(action.items.reduce((aggr, item) => {
					parentKey = get(action, 'item.parentItem');
					if(parentKey) {
						//@TODO: Optimise (inject loops over all items of the first argument)
						if(parentKey in aggr) {
							aggr[parentKey] = inject(
								aggr[parentKey], item.key
							);
						} else if(parentKey in state) {
							aggr[parentKey] = inject(
								state[parentKey], item.key
							);
						}
					}
					return aggr;
				}, {}))
			};
		case RECEIVE_DELETE_ITEM:
			parentKey = get(action, 'item.parentItem');
			if(parentKey) {
				return {
					...state,
					[parentKey]: state[parentKey].filter(key => key !== action.item.key)
				};
			}
			return state;
		case RECEIVE_DELETE_ITEMS:
			return Object.entries(state).reduce((aggr, [parentKey, itemKeys]) => {
				aggr[parentKey] = itemKeys.filter(key => !action.itemKeys.includes(key))
				return aggr;
			}, {});
		case RECEIVE_CHILD_ITEMS:
			return populate(
				state, action.items.map(item => item.key), action.start,
				action.limit, action.totalResults
			);
		case SORT_ITEMS:
			return Object.entries(state).reduce((aggr, [parentKey, itemKeys]) => {
				aggr[parentKey] = new Array(itemKeys.length);
				return aggr
			}, {});
		default:
			return state;
	}
};

module.exports = itemsByParent;

'use strict';
const { get } = require('../../utils');
const {
	RECEIVE_CHILD_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
} = require('../../constants/actions.js');

const itemsByParent = (state = {}, action) => {
	var parentKey;
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			parentKey = get(action, 'item.parentItem');
			if(parentKey) {
				return {
					...state,
					[parentKey]: [
						...(parentKey in state ? state[parentKey] : []),
						action.item.key
					]
				};
			}
			return state;
		case RECEIVE_CREATE_ITEMS:
			return {
				...state,
				...(action.items.reduce((aggr, item) => {
					parentKey = get(action, 'item.parentItem');
					if(parentKey) {
						if(parentKey in aggr) {
							aggr[parentKey] = [...aggr[parentKey], item.key]
						} else if(parentKey in state) {
							aggr[parentKey] = [...state[parentKey], item.key]
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
			return {
				...state,
				[action.itemKey]: action.childItems.map(item => item.key)
			};
		default:
			return state;
	}
};

module.exports = itemsByParent;

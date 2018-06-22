'use strict';

const {
	PRE_UPDATE_ITEM,
	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	ERROR_UPDATE_ITEM,
} = require('../../constants/actions');

const stateDefault = { items: {} };

const updating = (state = stateDefault, action) => {
	switch(action.type) {
		case PRE_UPDATE_ITEM:
			return {
				...state,
				items: {
					...state.items,
					[action.itemKey]: [
						...(action.itemKey in state.items ? state.items[action.itemKey] : []),
						{
							patch: action.patch,
							queueId: action.queueId,
							isRequested: false
						}
					]
				}
			};
		case REQUEST_UPDATE_ITEM:
			return {
				...state,
				items: {
					...state.items,
					[action.itemKey]: (state.items[action.itemKey] || []).map(queueItem => {
						if(queueItem.queueId === action.queueId) {
							queueItem.isRequested = true;
						}
						return queueItem;
					})
				}
			};
		case RECEIVE_UPDATE_ITEM:
		case ERROR_UPDATE_ITEM:
			var newState = {
				...state,
				items: {
					...state.items,
					[action.itemKey]: (state.items[action.itemKey] || [])
						.filter(queueItem => queueItem.queueId !== action.queueId)
				}
			};
			if(Object.keys(newState.items[action.itemKey]).length === 0) {
				delete newState.items[action.itemKey];
			}
			return newState;
		default:
			return state;
	}
};

module.exports = updating;

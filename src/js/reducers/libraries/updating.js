'use strict';

import {
    PRE_UPDATE_ITEM,
    REQUEST_UPDATE_ITEM,
    RECEIVE_UPDATE_ITEM,
    ERROR_UPDATE_ITEM,
    PRE_UPDATE_COLLECTION,
    REQUEST_UPDATE_COLLECTION,
    RECEIVE_UPDATE_COLLECTION,
    ERROR_UPDATE_COLLECTION,
} from '../../constants/actions';

const stateDefault = {
	collections: {},
	items: {},
};

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
		case PRE_UPDATE_COLLECTION:
			return {
				...state,
				collections: {
					...state.collections,
					[action.collectionKey]: [
						...(action.collectionKey in state.collections ?
								state.collections[action.collectionKey] : []),
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
		case REQUEST_UPDATE_COLLECTION:
			return {
				...state,
				collections: {
					...state.collections,
					[action.collectionKey]: (state.collections[action.collectionKey] || []).map(queueItem => {
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
		case RECEIVE_UPDATE_COLLECTION:
		case ERROR_UPDATE_COLLECTION:
			var newState = { // eslint-disable-line no-redeclare
				...state,
				collections: {
					...state.collections,
					[action.collectionKey]: (state.collections[action.collectionKey] || [])
						.filter(queueItem => queueItem.queueId !== action.queueId)
				}
			};
			if(Object.keys(newState.collections[action.collectionKey]).length === 0) {
				delete newState.collections[action.collectionKey];
			}
			return newState;
		default:
			return state;
	}
};

export default updating;

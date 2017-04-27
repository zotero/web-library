'use strict';

import {
	SELECT_LIBRARY,
	SELECT_ITEM,

	REQUEST_FETCH_ITEMS,
	RECEIVE_FETCH_ITEMS,
	ERROR_FETCH_ITEMS,

	REQUEST_FETCH_COLLECTIONS,
	RECEIVE_FETCH_COLLECTIONS,
	ERROR_FETCH_COLLECTIONS,

	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	ERROR_UPDATE_ITEM,

	REQUEST_CREATOR_TYPES,
	RECEIVE_CREATOR_TYPES,
	ERROR_CREATOR_TYPES,

	TRIGGER_EDITING_ITEM
} from './actions.js';

//TODO: according to the docs, we shouldn't be using this
import {
	ROUTER_DID_CHANGE
} from 'redux-router/lib/constants';


function library(state = null, action) {
	switch(action.type) {
		case SELECT_LIBRARY:
			return action.library;
		default:
			return state;
	}
}

function collectionsByLibrary(state = {
	isFetching: false,
	collections: []
}, action) {
	switch(action.type) {
		case REQUEST_FETCH_COLLECTIONS:
			return Object.assign({}, state, {
				isFetching: true
			});
		case RECEIVE_FETCH_COLLECTIONS:
			return Object.assign({}, state, {
				isFetching: false,
				collections: action.collections
			});
		case ERROR_FETCH_COLLECTIONS:
			return Object.assign({}, state, {
				isFetching: false
			});
		default:
			return state;
	}
}

function collections(state = {
	selected: ''
}, action) {
	switch(action.type) {
		case REQUEST_FETCH_COLLECTIONS:
		case RECEIVE_FETCH_COLLECTIONS:
		case ERROR_FETCH_COLLECTIONS:
			return Object.assign({}, state, {
				[action.libraryString]: collectionsByLibrary(state[action.libraryString], action)
			});
		default:
			return state;
	}
}

function itemsByCollection(state = {
	isFetching: false,
	items: []
}, action) {
	switch(action.type) {
		case REQUEST_FETCH_ITEMS:
			return Object.assign({}, state, {
				isFetching: true
			});

		case RECEIVE_FETCH_ITEMS:
			return Object.assign({}, state, {
				isFetching: false,
				items: action.items
			});

		case ERROR_FETCH_ITEMS:
			return Object.assign({}, state, {
				isFetching: false
			});

		default:
			return state;
	}
}

function fieldsBeingUpdated(state = [], action) {
	switch(action.type) {
		case REQUEST_UPDATE_ITEM:
			return [...new Set(state.concat(action.field.key))];
			
		case ERROR_UPDATE_ITEM:
		case RECEIVE_UPDATE_ITEM:
			return [...new Set(state.filter(entry => entry != action.field.key))];
	}
}

function itemsBeingUpdated(state = {}, action) {
	switch(action.type) {
		case REQUEST_UPDATE_ITEM:
			return {...state,
				[action.item.key]: fieldsBeingUpdated(state[action.item.key] || [], action)
			};
		case ERROR_UPDATE_ITEM:
		case RECEIVE_UPDATE_ITEM:
			var newState = Object.assign({}, state);
			var fields = fieldsBeingUpdated(state[action.item.key] || [], action);
			if(action.item.key in newState && fields.length === 0) {
				delete newState[action.item.key];
			}
			return newState;
	}
}

function items(state = {
	selected: '',
	updating: {}
}, action) {
	switch(action.type) {
		case REQUEST_FETCH_ITEMS:
		case RECEIVE_FETCH_ITEMS:
		case ERROR_FETCH_ITEMS:
			return Object.assign({}, state, {
				[action.collectionKey]: itemsByCollection(state[action.collectionKey], action)
			});
		case SELECT_ITEM:
			return Object.assign({}, state, {
				selected: action.index,
				editing: null
			});
		case REQUEST_UPDATE_ITEM:
		case RECEIVE_UPDATE_ITEM:
		case ERROR_UPDATE_ITEM:
			return Object.assign({}, state, {
				updating: itemsBeingUpdated(state['updating'], action)
			});
		case TRIGGER_EDITING_ITEM:
			return Object.assign({}, state, {
				editing: action.editing ? action.itemKey : null
			});
		case ROUTER_DID_CHANGE:
			return Object.assign({}, state, {
				editing: null
			});
		default:
			return state;
	}
}

function config(state = {}) {
	return state;
}

function creatorTypes(state = {}, action) {
	switch(action.type) {
		case REQUEST_CREATOR_TYPES:
			return {
				...state,
				[action.itemType]: {
					isFetching: true
				}
			};
		case RECEIVE_CREATOR_TYPES:
			return {
				...state,
				[action.itemType]: {
					isFetching: false,
					value: action.creatorTypes
				}
			};
		case ERROR_CREATOR_TYPES:
			return {
				...state,
				[action.itemType]: {
					isFetching: false
				}
			};
		default:
			return state;
	}	
}

export default {
	library,
	collections,
	items,
	config,
	creatorTypes
};
'use strict';

import {
	SELECT_LIBRARY,
	SELECT_ITEM,
	REQUEST_ITEMS,
	RECEIVE_ITEMS,
	REQUEST_COLLECTIONS,
	RECEIVE_COLLECTIONS,
	ERROR_FETCHING_COLLECTIONS,
	ERROR_FETCHING_ITEMS
} from './actions.js';


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
		case REQUEST_COLLECTIONS:
			return Object.assign({}, state, {
				isFetching: true
			});
		case RECEIVE_COLLECTIONS:
			return Object.assign({}, state, {
				isFetching: false,
				collections: action.collections
			});
		case ERROR_FETCHING_COLLECTIONS:
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
		case REQUEST_COLLECTIONS:
		case RECEIVE_COLLECTIONS:
		case ERROR_FETCHING_COLLECTIONS:
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
		case REQUEST_ITEMS:
			return Object.assign({}, state, {
				isFetching: true
			});

		case RECEIVE_ITEMS:
			return Object.assign({}, state, {
				isFetching: false,
				items: action.items
			});

		case ERROR_FETCHING_ITEMS:
			return Object.assign({}, state, {
				isFetching: false
			});

		default:
			return state;
	}
}

function items(state = {
	selected: ''
}, action) {
	switch(action.type) {
		case REQUEST_ITEMS:
		case RECEIVE_ITEMS:
		case ERROR_FETCHING_ITEMS:
			return Object.assign({}, state, {
				[action.collectionKey]: itemsByCollection(state[action.collectionKey], action)
			});
		case SELECT_ITEM:
			return Object.assign({}, state, {
				selected: action.index
			});
		default:
			return state;
	}
}

function config(state = {}) {
	return state;
}

export default {
	library,
	collections,
	items,
	config
};
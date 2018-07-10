'use strict';

const {
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_CHILD_ITEMS,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_TOP_ITEMS,
	RECEIVE_TRASH_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
} = require('../../constants/actions.js');

const version = (state = 0, action) => {
	switch(action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		case RECEIVE_ITEMS_IN_COLLECTION:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		case RECEIVE_CHILD_ITEMS:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		case RECEIVE_FETCH_ITEMS:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		case RECEIVE_TOP_ITEMS:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		case RECEIVE_TRASH_ITEMS:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		case RECEIVE_MOVE_ITEMS_TRASH:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		default:
			return state;
	}
};

module.exports = version;

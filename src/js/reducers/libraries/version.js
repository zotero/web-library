'use strict';

const {
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_CHILD_ITEMS,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_CREATE_ITEM,
	RECEIVE_FETCH_ITEMS,
	RECEIVE_ITEMS_IN_COLLECTION,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_TOP_ITEMS,
	RECEIVE_TRASH_ITEMS,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_DELETE_ITEMS,
} = require('../../constants/actions.js');

const version = (state = 0, action) => {
	switch(action.type) {
		case RECEIVE_ADD_ITEMS_TO_COLLECTION:
		case RECEIVE_CHILD_ITEMS:
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		case RECEIVE_CREATE_ITEM:
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_ITEMS_IN_COLLECTION:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_TOP_ITEMS:
		case RECEIVE_TRASH_ITEMS:
		case RECEIVE_UPDATE_ITEM:
		case RECEIVE_DELETE_ITEMS:
			return parseInt(action.response.response.headers.get('Last-Modified-Version'), 10);
		default:
			return state;
	}
};

module.exports = version;

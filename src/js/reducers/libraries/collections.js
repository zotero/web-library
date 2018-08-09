'use strict';

const {
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	RECEIVE_CREATE_COLLECTION,
	RECEIVE_DELETE_COLLECTION,
	RECEIVE_UPDATE_COLLECTION,
} = require('../../constants/actions.js');
const { indexByKey } = require('../../utils');
const { removeKeys } = require('../../common/immutable');

const collections = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_COLLECTION:
		case RECEIVE_UPDATE_COLLECTION:
			return {
				...state,
				[action.collection.key]: action.collection
			}
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...indexByKey(action.collections, 'key')
			};
		case RECEIVE_DELETE_COLLECTION:
			return removeKeys(state, action.collection.key);
		default:
			return state;
	}
};

module.exports = collections;

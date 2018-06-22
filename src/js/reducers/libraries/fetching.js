'use strict';

const {
	REQUEST_ITEMS_IN_COLLECTION,
	RECEIVE_ITEMS_IN_COLLECTION,
	ERROR_ITEMS_IN_COLLECTION,
	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	ERROR_CHILD_ITEMS,
	REQUEST_FETCH_ITEMS,
	RECEIVE_FETCH_ITEMS,
	ERROR_FETCH_ITEMS,
	REQUEST_TOP_ITEMS,
	RECEIVE_TOP_ITEMS,
	ERROR_TOP_ITEMS,
} = require('../../constants/actions');

const fetching = (state = {
	items: [],
	itemsInCollection: [],
	itemsTop: false,
}, action) => {
	switch(action.type) {
		case REQUEST_ITEMS_IN_COLLECTION:
			return {
				...state,
				itemsInCollection: [
					...(state.itemsInCollection || []),
					action.collectionKey
				]
			};
		case RECEIVE_ITEMS_IN_COLLECTION:
		case ERROR_ITEMS_IN_COLLECTION:
			return {
				...state,
				itemsInCollection: state.itemsInCollection
					.filter(key => key !== action.collectionKey)
			};
		case REQUEST_CHILD_ITEMS:
			return {
				...state,
				childItems: [
					...(state.childItems || []),
					action.itemKey
				]
			};
		case RECEIVE_CHILD_ITEMS:
		case ERROR_CHILD_ITEMS:
			return {
				...state,
				childItems: state.childItems
					.filter(key => key !== action.itemKey)
			};
		case REQUEST_FETCH_ITEMS:
			return {
				...state,
				items: [
					...(state.items || []),
					...action.itemKeys
				]
			};
		case RECEIVE_FETCH_ITEMS:
		case ERROR_FETCH_ITEMS:
			return {
				...state,
				items: state.items.filter(key => action.itemKeys.includes(key))
			};
		case REQUEST_TOP_ITEMS:
			return {
				...state,
				itemsTop: true
			};
		case RECEIVE_TOP_ITEMS:
		case ERROR_TOP_ITEMS:
			return {
				...state,
				itemsTop: false
			};
	}
}

module.exports = fetching;

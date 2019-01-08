'use strict';

const {
	REQUEST_META,
	RECEIVE_META,
	ERROR_META,
	REQUEST_COLLECTIONS_IN_LIBRARY,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	ERROR_COLLECTIONS_IN_LIBRARY,
	REQUEST_ITEM_TYPE_CREATOR_TYPES,
	RECEIVE_ITEM_TYPE_CREATOR_TYPES,
	ERROR_ITEM_TYPE_CREATOR_TYPES,
	REQUEST_ITEM_TYPE_FIELDS,
	RECEIVE_ITEM_TYPE_FIELDS,
	ERROR_ITEM_TYPE_FIELDS,
	REQUEST_ITEM_TEMPLATE,
	RECEIVE_ITEM_TEMPLATE,
	ERROR_ITEM_TEMPLATE,
	REQUEST_TAGS_IN_LIBRARY,
	RECEIVE_TAGS_IN_LIBRARY,
	ERROR_TAGS_IN_LIBRARY
} = require('../constants/actions');

const fetching = (state = {
	collectionsInLibrary: [],
	creatorTypes: [],
	itemTemplates: [],
	itemTypeCreatorTypes: [],
	itemTypeFields: [],
	tagsInLibrary: [],
	meta: false,
}, action) => {
	switch(action.type) {
		case REQUEST_META:
			return {
				...state,
				meta: true
			};
		case RECEIVE_META:
		case ERROR_META:
			return {
				...state,
				meta: false
			};
		case REQUEST_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				collectionsInLibrary: [
					...(state.collectionsInLibrary || []),
					action.libraryKey
				]
			};
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		case ERROR_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				collectionsInLibrary: (state.collectionsInLibrary || [])
					.filter(key => key !== action.libraryKey)
			};
		case REQUEST_TAGS_IN_LIBRARY:
			return {
				...state,
				tagsInLibrary: [
					...(state.tagsInLibrary || []),
					action.libraryKey
				]
			};
		case RECEIVE_TAGS_IN_LIBRARY:
		case ERROR_TAGS_IN_LIBRARY:
			return {
				...state,
				tagsInLibrary: (state.tagsInLibrary || [])
					.filter(key => key !== action.libraryKey)
			};
		case REQUEST_ITEM_TYPE_CREATOR_TYPES:
			return {
				...state,
				itemTypeCreatorTypes: [
					...(state.itemTypeCreatorTypes || []),
					action.itemType
				]
			};
		case RECEIVE_ITEM_TYPE_CREATOR_TYPES:
		case ERROR_ITEM_TYPE_CREATOR_TYPES:
			return {
				...state,
				itemTypeCreatorTypes: state.itemTypeCreatorTypes
					.filter(it => it !== action.itemType)
			};

		case REQUEST_ITEM_TYPE_FIELDS:
			return {
				...state,
				itemTypeFields: [...(state.itemTypeFields || []), action.itemType]
			};
		case RECEIVE_ITEM_TYPE_FIELDS:
		case ERROR_ITEM_TYPE_FIELDS:
			return {
				...state,
				itemTypeFields: state.itemTypeFields
					.filter(it => it !== action.itemType)
			};
		case REQUEST_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: [
					...(state.itemTemplates || []),
					action.itemType
				]
			};
		case RECEIVE_ITEM_TEMPLATE:
		case ERROR_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: state.itemTemplates
					.filter(it => it !== action.itemType)
			};
		default:
			return state;
	}
};

module.exports = fetching;

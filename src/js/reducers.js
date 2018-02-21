'use strict';

const { ck, without } = require('./utils');

const {
	CONFIGURE_API,

	ROUTE_CHANGE,
	
	REQUEST_META,
	RECEIVE_META,
	ERROR_META,

	SELECT_LIBRARY,
	SELECT_ITEM,

	REQUEST_ITEMS_IN_COLLECTION,
	RECEIVE_ITEMS_IN_COLLECTION,
	ERROR_ITEMS_IN_COLLECTION,

	REQUEST_COLLECTIONS_IN_LIBRARY,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	ERROR_COLLECTIONS_IN_LIBRARY,

	PRE_UPDATE_ITEM,
	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	ERROR_UPDATE_ITEM,

	PRE_CREATE_ITEM,
	REQUEST_CREATE_ITEM,
	RECEIVE_CREATE_ITEM,
	ERROR_CREATE_ITEM,

	REQUEST_DELETE_ITEM,
	RECEIVE_DELETE_ITEM,
	ERROR_DELETE_ITEM,

	REQUEST_ITEM_TYPE_CREATOR_TYPES,
	RECEIVE_ITEM_TYPE_CREATOR_TYPES,
	ERROR_ITEM_TYPE_CREATOR_TYPES,

	REQUEST_ITEM_TYPE_FIELDS,
	RECEIVE_ITEM_TYPE_FIELDS,
	ERROR_ITEM_TYPE_FIELDS,

	REQUEST_ITEM_TEMPLATE,
	RECEIVE_ITEM_TEMPLATE,
	ERROR_ITEM_TEMPLATE,

	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	ERROR_CHILD_ITEMS,

	REQUEST_FETCH_ITEMS,
	RECEIVE_FETCH_ITEMS,
	ERROR_FETCH_ITEMS,

	REQUEST_TOP_ITEMS,
	RECEIVE_TOP_ITEMS,
	ERROR_TOP_ITEMS,

	TRIGGER_EDITING_ITEM,
	TRIGGER_RESIZE_VIEWPORT
} = require('./constants/actions.js');

function removeKey(state, deleteKeys) {
	if(!Array.isArray(deleteKeys)) {
		deleteKeys = [deleteKeys];
	}

	return Object.keys(state)
		.filter(key => !deleteKeys.includes(key))
		.reduce((aggr, current) => {
			aggr[current] = state[current];
		return aggr;
  }, {});
}

//@TODO: multi-library support
const library = (state = {}, action) => {
	switch(action.type) {
		case SELECT_LIBRARY:
			return {
				...state,
				libraryKey: action.libraryKey
			};
		default:
			return state;
	}
};

const meta = (state = {
	itemTypeCreatorTypes: {},
	itemTypeFields: {},
	itemTemplates: {}
}, action) => {
	switch(action.type) {
		case RECEIVE_META:
			return {
				...state,
				itemTypes: action.itemTypes,
				itemFields: action.itemFields,
				creatorFields: action.creatorFields
			};
		case RECEIVE_ITEM_TYPE_CREATOR_TYPES:
			return {
				...state,
				itemTypeCreatorTypes: itemTypeCreatorTypes(state.itemTypeCreatorTypes, action)
			};
		case RECEIVE_ITEM_TYPE_FIELDS:
			return {
				...state,
				itemTypeFields: itemTypeFields(state.itemTypeFields, action)
			};
		case RECEIVE_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: itemTemplates(state.itemTemplates, action)
			};
	}

	return state;
};

const config = (state = {}, action) => {
	if(action.type === CONFIGURE_API) {
		return {
			...state,
			apiKey: action.apiKey,
			apiConfig: action.apiConfig
		};
	} else {
		return state;
	}
};

const collections = (state = {}, action) => {
	var collections;
	switch(action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		collections = action.collections.reduce((aggr, collection) => {
			aggr[ck(collection.key, action.libraryKey)] = collection;
			return aggr;
		}, {});
			return { 
				...state,
				...collections
			};
		default:
			return state;
	}
};

const collectionsByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				[action.libraryKey]: action.collections.map(collection => ck(collection.key, action.libraryKey))
			};
		default:
			return state;
	}
};

const fetching = (state = {
	collectionsInLibrary: [],
	itemsInCollection: [],
	creatorTypes: [],
	itemTypeFields: [],
	itemTemplates: [],
	items: [],
	meta: false,
	itemsTop: false
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
				collectionsInLibrary: [...(state.collectionsInLibrary || []), action.libraryKey]
			};
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
		case ERROR_COLLECTIONS_IN_LIBRARY:
			return {
				...state, 
				collectionsInLibrary: without(state.collectionsInLibrary, action.libraryKey)
			};

		case REQUEST_ITEMS_IN_COLLECTION:
			return {
				...state,
				itemsInCollection: [...(state.itemsInCollection || []), ck(action.collectionKey, action.libraryKey)]
			};
		case RECEIVE_ITEMS_IN_COLLECTION:
		case ERROR_ITEMS_IN_COLLECTION:
			return {
				...state,
				itemsInCollection: without(state.itemsInCollection, ck(action.collectionKey, action.libraryKey))
			};

		case REQUEST_ITEM_TYPE_CREATOR_TYPES:
			return {
				...state,
				itemTypeCreatorTypes: [...(state.itemTypeCreatorTypes || []), action.itemType]
			};
		case RECEIVE_ITEM_TYPE_CREATOR_TYPES:
		case ERROR_ITEM_TYPE_CREATOR_TYPES:
			return {
				...state,
				itemTypeCreatorTypes: without(state.itemTypeCreatorTypes, action.itemType)
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
				itemTypeFields: without(state.itemTypeFields, action.itemType)
			};
		case REQUEST_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: [...(state.itemTemplates || []), action.itemType]
			};
		case RECEIVE_ITEM_TEMPLATE:
		case ERROR_ITEM_TEMPLATE:
			return {
				...state,
				itemTemplates: without(state.itemTemplates, action.itemType)
			};

		case REQUEST_CHILD_ITEMS:
			return {
				...state,
				childItems: [...(state.childItems || []), ck(action.itemKey, action.libraryKey)]
			};
		case RECEIVE_CHILD_ITEMS:
		case ERROR_CHILD_ITEMS:
			return {
				...state,
				childItems: without(state.childItems, ck(action.itemKey, action.libraryKey))
			};
		case REQUEST_FETCH_ITEMS:
			return {
				...state,
				items: [
					...(state.items || []),
					...action.itemKeys.map(itemKey => ck(itemKey, action.libraryKey))
				]
			};
		case RECEIVE_FETCH_ITEMS:
		case ERROR_FETCH_ITEMS:
			return {
				...state,
				items: without(
					state.items,
					action.itemKeys.map(itemKey => ck(itemKey, action.libraryKey))
				)
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
		default:
			return state;
	}
};

// const creating = (state = {
// 	items: {}
// }, action) => {
// 	switch (action.type) {
// 		case PRE_CREATE_ITEM:
// 			return {
// 				...state,
// 				items: [
// 					...state.items,
// 					{
// 						...action.properties
// 					}
// 				]
// 			};
// 		default:
// 			return state;
// 	}
// };

const updating = (state = {
	items: {}
}, action) => {
	const itemCKey = ck(action.itemKey, action.libraryKey);
	var newState;
	switch(action.type) {
		case PRE_UPDATE_ITEM:
			return {
				...state,
				items: {
					...state.items,
					[itemCKey]: [
						...(itemCKey in state.items ? state.items[itemCKey] : []),
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
					[itemCKey]: state.items[itemCKey].map(queueItem => {
						if(queueItem.queueId === action.queueId) {
							queueItem.isRequested = true;
						}
						return queueItem;
					})
				}
			};
		case RECEIVE_UPDATE_ITEM:
		case ERROR_UPDATE_ITEM:
			newState = {
				...state,
				items: {
					...state.items,
					[itemCKey]: (state.items[itemCKey] || []).filter(queueItem => queueItem.queueId !== action.queueId)
				}
			};
			if(Object.keys(newState.items[itemCKey]).length === 0) {
				delete newState.items[itemCKey];
			}
			return newState;
		default:
			return state;
	}
};

const deleting = (state = {
	items: []
}, action) => {
	switch(action.type) {
		case REQUEST_DELETE_ITEM:
			return {
				...state,
				items: [...state.items, ck(action.item.key, action.libraryKey)]
			};
		case RECEIVE_DELETE_ITEM:
		case ERROR_DELETE_ITEM:
			return {
				...state,
				items: without(state.items, ck(action.item.key, action.libraryKey))
			};
		default:
			return state;
	}
};

const items = (state = {}, action) => {
	var items;
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			return {
				...state,
				[ck(action.item.key, action.libraryKey)]: action.item
			};
		case RECEIVE_DELETE_ITEM:
			return removeKey(state, ck(action.item.key, action.libraryKey));
		case RECEIVE_ITEMS_IN_COLLECTION:
			items = action.items.reduce((aggr, item) => {
				aggr[ck(item.key, action.libraryKey)] = item;
				return aggr;
			}, {});
			return {
				...state,
				...items
			};
		case RECEIVE_UPDATE_ITEM:
			return {
				...state,
				[ck(action.itemKey, action.libraryKey)]: {
					...(state.items && action.itemKey in state.items ? state.items[action.itemKey] : {}),
					...action.item
				}
			};
		case RECEIVE_CHILD_ITEMS:
			items = action.childItems.reduce((aggr, item) => {
				aggr[ck(item.key, action.libraryKey)] = item;
				return aggr;
			}, {});
			return {
				...state,
				...items
			};
		case RECEIVE_FETCH_ITEMS:
		case RECEIVE_TOP_ITEMS:
			items = action.items.reduce((aggr, item) => {
				aggr[ck(item.key, action.libraryKey)] = item;
				return aggr;
			}, {});
			return {
				...state,
				...items
			};
		default: 
			return state;
	}
};

//@TODO move sorting from action to reducer (to support pagination)
const itemsByCollection = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			// @TODO: 
			return state;
		case RECEIVE_DELETE_ITEM:
			//@TODO:
			return state;
		case RECEIVE_ITEMS_IN_COLLECTION:
			return {
				...state,
				[ck(action.collectionKey, action.libraryKey)]: action.items.map(item => ck(item.key, action.libraryKey))
			};
		default:
			return state;
	}
};

const itemsTop = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			// @TODO: 
			return state;
		case RECEIVE_DELETE_ITEM:
			//@TODO:
			return state;
		case RECEIVE_TOP_ITEMS:
			return [
				...(new Set([
					...state,
					...action.items.map(item => ck(item.key, action.libraryKey))
				]))
			];
		default:
			return state;
	}
};

const itemsByParentItem = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			if(action.item.parentItem) {
				let parentKey = ck(action.item.parentItem, action.libraryKey);
				return {
					...state,
					[parentKey]: [
						...(parentKey in state && state[parentKey] || []),
						ck(action.item.key, action.libraryKey)
					]
				};
			}
			return state;
		case RECEIVE_DELETE_ITEM:
			if(action.item.parentItem) {
				let parentKey = ck(action.item.parentItem, action.libraryKey);
				return {
					...state,
					[parentKey]: without(state[parentKey], ck(action.item.key, action.libraryKey))
				};
			}
			return state;
		case RECEIVE_CHILD_ITEMS:
			return {
				...state,
				[ck(action.itemKey, action.libraryKey)]: action.childItems.map(item => ck(item.key, action.libraryKey))
			};
		default:
			return state;
	}
};

const itemTypeCreatorTypes = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_ITEM_TYPE_CREATOR_TYPES:
			return {
				...state,
				[action.itemType]: action.creatorTypes
			};
		default:
			return state;
	}
};

const itemCountByCollection = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_COLLECTIONS_IN_LIBRARY:
			return {
				...state,
				...(action.response.getData().reduce((aggr, collection, index) => {
					aggr[ck(collection.key, action.libraryKey)] = action.response.getMeta()[index].numItems;
					return aggr;
				}, {}))
			};
		default:
			return state;
	}	
};

const itemCountByLibrary = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_TOP_ITEMS:
			return {
				...state,
				[action.libraryKey]: action.response.response.headers.get('Total-Results')
			};
		default:
			return state;
	}	
};

const itemTypeFields = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_ITEM_TYPE_FIELDS:
			return {
				...state,
				[action.itemType]: action.fields
			};
		default:
			return state;
	}
};

const itemTemplates = (state = {}, action) => {
	switch(action.type) {
		case RECEIVE_ITEM_TEMPLATE:
			return {
				...state,
				[action.itemType]: action.template
			};
		default:
			return state;
	}
};

const viewport = (state = {}, action) => {
	switch(action.type) {
		case TRIGGER_RESIZE_VIEWPORT:
			return {
				width: action.width,
				height: action.height,
				xs: action.width < 480,
				sm: action.width < 768 && action.width > 480,
				md: action.width < 992 && action.width > 768,
				lg: action.width > 992
			};
		default: 
			return state;
	}
};

const router = (state = {
	params: {}
}, action) => {
	switch(action.type) {
		case ROUTE_CHANGE:
			return {
				...state,
				params: action.params
			};
		default:
			return state;
	}
};

module.exports = {
	collections,
	collectionsByLibrary,
	config,
	deleting,
	fetching,
	items,
	itemsByCollection,
	itemsByParentItem,
	itemsTop,
	itemCountByCollection,
	itemCountByLibrary,
	library,
	meta,
	router,
	updating,
	viewport,
};
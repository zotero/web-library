const cache = require('zotero-api-client-cache');
const api = require('zotero-api-client')().use(cache()).api;

const { ck } = require('./utils');

const {
	CONFIGURE_API,
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

	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	ERROR_UPDATE_ITEM,

	REQUEST_ITEM_TYPE_CREATOR_TYPES,
	RECEIVE_ITEM_TYPE_CREATOR_TYPES,
	ERROR_ITEM_TYPE_CREATOR_TYPES,

	REQUEST_ITEM_TYPE_FIELDS,
	RECEIVE_ITEM_TYPE_FIELDS,
	ERROR_ITEM_TYPE_FIELDS,

	REQUEST_CHILD_ITEMS,
	RECEIVE_CHILD_ITEMS,
	ERROR_CHILD_ITEMS,

	TRIGGER_EDITING_ITEM,
	TRIGGER_RESIZE_VIEWPORT
} = require('./constants/actions');

const configureApi = (apiKey, apiConfig = {}) => {
	return {
		type: CONFIGURE_API,
		apiKey,
		apiConfig
	};
};

//@TODO: separate authenticate and selectLibrary events
//		 allow having multiple open libraries as per design 
const selectLibrary = (type, id) => {
	return {
		type: SELECT_LIBRARY,
		libraryKey: api().library(type, id).getConfig().resource.library
	};
};

const initialize = () => {
	return async (dispatch, getState) => {
		const { apiConfig } = getState().config;
		dispatch({
			type: REQUEST_META
		});

		try {
			const [itemTypes, itemFields, creatorFields] = (await Promise.all([
				api(null, apiConfig).itemTypes().get(),
				api(null, apiConfig).itemFields().get(),
				api(null, apiConfig).creatorFields().get()
			])).map(response => response.getData());
			dispatch({
				type: RECEIVE_META,
				itemTypes, itemFields, creatorFields
			});
		} catch(error) {
			dispatch({
				type: ERROR_META,
				error
			});
			throw error;
		}
	};
};

const fetchCollections = (libraryKey) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey
		});
		try {
			const { config } = getState();
			const collections = (await api(config.apiKey, config.apiConfig).library(libraryKey).collections().get()).getData();
			collections.sort(
				(a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase())
			);

			dispatch({
				type: RECEIVE_COLLECTIONS_IN_LIBRARY,
				libraryKey,
				collections,
				receivedAt: Date.now()
			});
			return collections;
		} catch(error) {
			dispatch({
				type: ERROR_COLLECTIONS_IN_LIBRARY,
				libraryKey,
				error
			});
			throw error;
		}
	};
};

const fetchItems = (collectionKey) => {
	return async (dispatch, getState) => {
		let { config, library } = getState();
		
		dispatch({
			type: REQUEST_ITEMS_IN_COLLECTION,
			libraryKey: library.libraryKey,
			collectionKey
		});
		try {
			//@TODO: support for paging/infinite scroll
			let items = (await api(config.apiKey, config.apiConfig)
				.library(library.libraryKey)
				.collections(collectionKey)
				.items()
				.get({
					limit: 50
				})).getData();

			items.sort(
				(a, b) => {
					return (a.title || '').toUpperCase().localeCompare((b.title || '').toUpperCase());
				}
			);

			dispatch({
				type: RECEIVE_ITEMS_IN_COLLECTION,
				libraryKey: library.libraryKey,
				collectionKey,
				items,
				receivedAt: Date.now()
			});

			return items;
		} catch(error) {
			dispatch({
				type: ERROR_ITEMS_IN_COLLECTION,
				libraryKey: library.libraryKey,
				collectionKey,
				error
			});

			throw error;
		}
	};
};

const updateItem = (libraryKey, itemKey, patch) => {
	return async dispatch => {
		dispatch({
			type: REQUEST_UPDATE_ITEM,
			itemKey,
			libraryKey,
			patch
		});

		await dispatch(
			queueUpdateItem(itemKey, libraryKey, patch)
		);
	};
};

const fetchItemTypeCreatorTypes = (itemType) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TYPE_CREATOR_TYPES,
			itemType
		});
		let config = getState().config;
		try {
			let creatorTypes = (await api(config.apiKey, config.apiConfig).itemTypeCreatorTypes(itemType).get()).getData();
			dispatch({
				type: RECEIVE_ITEM_TYPE_CREATOR_TYPES,
				itemType,
				creatorTypes
			});
			return creatorTypes;
		} catch(error) {
			dispatch({
				type: ERROR_ITEM_TYPE_CREATOR_TYPES,
				error,
				itemType
			});
			throw error;
		}
	};
};

const fetchItemTypeFields = (itemType) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TYPE_FIELDS,
			itemType
		});
		let config = getState().config;
		try {
			let fields = (await api(config.apiKey, config.apiConfig).itemTypeFields(itemType).get()).getData();
			dispatch({
				type: RECEIVE_ITEM_TYPE_FIELDS,
				itemType,
				fields
			});
			return fields;
		} catch(error) {
			dispatch({
				type: ERROR_ITEM_TYPE_FIELDS,
				itemType,
				error
			});
			throw error;
		}
	};
};

const fetchChildItems = (itemKey, libraryKey) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_CHILD_ITEMS,
			itemKey,
			libraryKey
		});
		let config = getState().config;
		try {
			let childItems = (await api(config.apiKey, config.apiConfig).library(libraryKey).items(itemKey).children().get()).getData();
			dispatch({
				type: RECEIVE_CHILD_ITEMS,
				itemKey,
				libraryKey,
				childItems
			});
		} catch(error) {
			dispatch({
				type: ERROR_CHILD_ITEMS,
				error,
				itemKey,
				libraryKey
			});
		}
	};
};

const triggerEditingItem = (itemKey, libraryKey, editing) => {
	return {
		type: TRIGGER_EDITING_ITEM,
		itemKey,
		libraryKey,
		editing
	};
};

const triggerResizeViewport = (width, height) => {
	return {
		type: TRIGGER_RESIZE_VIEWPORT,
		width,
		height
	};
};

function queueUpdateItem(itemKey, libraryKey, patch) {
	return {
		queue: ck(itemKey, libraryKey),
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;
			const item = state.items[ck(itemKey, libraryKey)];
			const version = item.version;
			
			try {
				const response = await api(config.apiKey, config.apiConfig).library(libraryKey).items(itemKey).version(version).patch(patch);
				const updatedItem = {
					...item,
					...response.getData()
				};

				for(var collectionKey of updatedItem.collections) {
					api().invalidate('resource.collections', collectionKey);
				}
				api().invalidate('resource.items', itemKey);

				dispatch({
					type: RECEIVE_UPDATE_ITEM,
					item: updatedItem,
					itemKey,
					libraryKey,
					patch
				});

				return updatedItem;
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_ITEM,
					error,
					itemKey,
					libraryKey,
					patch
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

module.exports = {
	configureApi,
	initialize,
	selectLibrary,
	updateItem,
	fetchItems,
	fetchCollections,
	fetchItemTypeCreatorTypes,
	fetchItemTypeFields,
	triggerEditingItem,
	triggerResizeViewport,
	fetchChildItems
};
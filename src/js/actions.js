const cache = require('zotero-api-client-cache');
const api = require('zotero-api-client')().use(cache()).api;

const { ck, get } = require('./utils');
const { getLibraryKey } = require('./state-utils');

var queueIdCunter = 0;

const {
	CONFIGURE_API,
	REQUEST_META,
	RECEIVE_META,
	ERROR_META,

	ROUTE_CHANGE,

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

	TRIGGER_EDITING_ITEM,
	TRIGGER_RESIZE_VIEWPORT
} = require('./constants/actions');

const changeRoute = params => {
	return {
		type: ROUTE_CHANGE,
		params
	};
};

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
			let response = await api(config.apiKey, config.apiConfig)
				.library(library.libraryKey)
				.collections(collectionKey)
				.items()
				.top()
				.get({
					limit: 50
				});
			let items = response.getData();

			response.raw.forEach((raw, i) => {
				if('meta' in raw) {
					items[i][Symbol.for('meta')] = raw.meta;
				}
			});

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

const fetchItemTemplate = (itemType) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TEMPLATE,
			itemType
		});
		let config = getState().config;
		try {
			let template = (await api(config.apiKey, config.apiConfig).template(itemType).get()).getData();
			dispatch({
				type: RECEIVE_ITEM_TEMPLATE,
				itemType,
				template
			});
			return template;
		} catch(error) {
			dispatch({
				type: ERROR_ITEM_TEMPLATE,
				itemType,
				error
			});
			throw error;
		}
	};
};

const fetchChildItems = (itemKey, libraryKey) => {
	return async (dispatch, getState) => {
		let config = getState().config;
		libraryKey = libraryKey || getLibraryKey(getState());
		dispatch({
			type: REQUEST_CHILD_ITEMS,
			itemKey,
			libraryKey
		});
		
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

function createItem(properties) {
	return async (dispatch, getState) => {
		// dispatch({
		// 	type: PRE_CREATE_ITEM,
		// 	properties
		// });
		const state = getState();
		const libraryKey = getLibraryKey(getState());
		const config = state.config;
		dispatch({
			type: REQUEST_CREATE_ITEM,
			libraryKey,
			properties
		});

		try {
			let response = await api(config.apiKey, config.apiConfig).library(libraryKey).items().post([properties]);
			if(!response.isSuccess()) {
				throw response.getErrors()[0];
			}

			dispatch({
				type: RECEIVE_CREATE_ITEM,
				libraryKey,
				item: response.getEntityByIndex(0)
			});
		} catch(error) {
			dispatch({
					type: ERROR_CREATE_ITEM,
					error,
					libraryKey,
					properties,
				});
			throw error;
		}

		if(properties.parentItem) {
			api().invalidate({
				'resource.items': properties.parentItem,
				'resource.children': null
			});
		}
	};
}

function deleteItem(item) {
	return async (dispatch, getState) => {
		const libraryKey = getLibraryKey(getState());
		const config = getState().config;

		dispatch({
			type: REQUEST_DELETE_ITEM,
			libraryKey,
			item
		});

		try {
			await api(config.apiKey, config.apiConfig)
			.library(libraryKey).items(item.key).version(item.version).delete();
			dispatch({
				type: RECEIVE_DELETE_ITEM,
				libraryKey,
				item
			});
		} catch(error) {
			dispatch({
					type: ERROR_DELETE_ITEM,
					error,
					libraryKey,
					item,
				});
			throw error;
		}
	};
}

function updateItem(itemKey, patch) {
	return async (dispatch, getState) => {
		const libraryKey = getLibraryKey(getState());
		const queueId = ++queueIdCunter;

		dispatch({
			type: PRE_UPDATE_ITEM,
			itemKey,
			libraryKey,
			patch,
			queueId
		});

		if('itemType' in patch) {
			// when changing itemType, we may need to remove some fields
			// from the patch to avoid 400. Usually these are the base-mapped 
			// fields from the source type that are illegal in the target type
			await dispatch(
				fetchItemTypeFields(patch.itemType)
			);

			let itemTypeFields = get(getState(), ['meta', 'itemTypeFields', patch.itemType]);
			if(itemTypeFields) {
				itemTypeFields = [
					'itemType',
					...itemTypeFields.map(fieldDetails => fieldDetails.field)
				];
				Object.keys(patch).forEach(patchedKey => {
					if(!itemTypeFields.includes(patchedKey)) {
						delete patch[patchedKey];
					}
				});
			}
		}

		dispatch(
			queueUpdateItem(itemKey, patch, libraryKey, queueId)
		);
	};
}

function queueUpdateItem(itemKey, patch, libraryKey, queueId) {
	return {
		queue: ck(itemKey, libraryKey),
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;
			const item = state.items[ck(itemKey, libraryKey)];
			const version = item.version;

			dispatch({
				type: REQUEST_UPDATE_ITEM,
				itemKey,
				libraryKey,
				patch,
				queueId
			});
			
			try {
				const response = await api(config.apiKey, config.apiConfig).library(libraryKey).items(itemKey).version(version).patch(patch);
				const updatedItem = {
					...item,
					...response.getData()
				};

				if(updatedItem.collections) {
					for(var collectionKey of updatedItem.collections) {
						api().invalidate('resource.collections', collectionKey);
					}
				}

				if(updatedItem.parentItem) {
					api().invalidate({
						'resource.items': updatedItem.parentItem,
						'resource.children': null
					});
				}
				api().invalidate('resource.items', itemKey);

				dispatch({
					type: RECEIVE_UPDATE_ITEM,
					item: updatedItem,
					itemKey,
					libraryKey,
					patch,
					queueId
				});

				return updatedItem;
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_ITEM,
					error,
					itemKey,
					libraryKey,
					patch,
					queueId
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

module.exports = {
	changeRoute,
	configureApi,
	initialize,
	selectLibrary,
	createItem,
	updateItem,
	deleteItem,
	fetchItems,
	fetchCollections,
	fetchItemTypeCreatorTypes,
	fetchItemTypeFields,
	fetchItemTemplate,
	triggerEditingItem,
	triggerResizeViewport,
	fetchChildItems
};
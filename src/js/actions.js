const cache = require('zotero-api-client-cache');
const api = require('zotero-api-client')().use(cache()).api;
// const api = require('zotero-api-client')().api;
const { get, JSONTryParse } = require('./utils');
const { getQueryFromRoute } = require('./common/navigation');
const { preferences: defaultPreferences } = require('./constants/defaults');
const { removeKeys } = require('./common/immutable');
const deepEqual = require('deep-equal');


var queueIdCunter = 0;

const {
	CONFIGURE_API,
	REQUEST_META,
	RECEIVE_META,
	ERROR_META,

	ROUTE_CHANGE,
	QUERY_CHANGE,

	SELECT_ITEM,

	REQUEST_ITEMS_IN_COLLECTION,
	RECEIVE_ITEMS_IN_COLLECTION,
	ERROR_ITEMS_IN_COLLECTION,

	REQUEST_COLLECTIONS_IN_LIBRARY,
	RECEIVE_COLLECTIONS_IN_LIBRARY,
	ERROR_COLLECTIONS_IN_LIBRARY,

	REQUEST_GROUPS,
	RECEIVE_GROUPS,
	ERROR_GROUPS,

	PRE_UPDATE_ITEM,
	REQUEST_UPDATE_ITEM,
	RECEIVE_UPDATE_ITEM,
	ERROR_UPDATE_ITEM,

	REQUEST_CREATE_ITEM,
	RECEIVE_CREATE_ITEM,
	ERROR_CREATE_ITEM,

	REQUEST_CREATE_ITEMS,
	RECEIVE_CREATE_ITEMS,
	ERROR_CREATE_ITEMS,

	REQUEST_UPLOAD_ATTACHMENT,
	RECEIVE_UPLOAD_ATTACHMENT,
	ERROR_UPLOAD_ATTACHMENT,

	REQUEST_DELETE_ITEM,
	RECEIVE_DELETE_ITEM,
	ERROR_DELETE_ITEM,

	REQUEST_DELETE_ITEMS,
	RECEIVE_DELETE_ITEMS,
	ERROR_DELETE_ITEMS,

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

	REQUEST_TRASH_ITEMS,
	RECEIVE_TRASH_ITEMS,
	ERROR_TRASH_ITEMS,

	PRE_MOVE_ITEMS_TRASH,
	REQUEST_MOVE_ITEMS_TRASH,
	RECEIVE_MOVE_ITEMS_TRASH,
	ERROR_MOVE_ITEMS_TRASH,

	PRE_RECOVER_ITEMS_TRASH,
	REQUEST_RECOVER_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	ERROR_RECOVER_ITEMS_TRASH,

	ERROR_CREATE_COLLECTION,
	RECEIVE_CREATE_COLLECTION,
	REQUEST_CREATE_COLLECTION,

	SORT_ITEMS,

	PREFERENCE_CHANGE,
	PREFERENCES_LOAD,

	TRIGGER_EDITING_ITEM,
	TRIGGER_RESIZE_VIEWPORT,

	PRE_ADD_ITEMS_TO_COLLECTION,
	REQUEST_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	ERROR_ADD_ITEMS_TO_COLLECTION,

	PRE_UPDATE_COLLECTION,
	REQUEST_UPDATE_COLLECTION,
	RECEIVE_UPDATE_COLLECTION,
	ERROR_UPDATE_COLLECTION,

	REQUEST_DELETE_COLLECTION,
	RECEIVE_DELETE_COLLECTION,
	ERROR_DELETE_COLLECTION,

	REQUEST_LIBRARY_SETTINGS,
	RECEIVE_LIBRARY_SETTINGS,
	ERROR_LIBRARY_SETTINGS,

	REQUEST_TAGS_IN_COLLECTION,
	RECEIVE_TAGS_IN_COLLECTION,
	ERROR_TAGS_IN_COLLECTION,

	REQUEST_TAGS_IN_LIBRARY,
	RECEIVE_TAGS_IN_LIBRARY,
	ERROR_TAGS_IN_LIBRARY,

	REQUEST_TAGS_FOR_ITEM,
	RECEIVE_TAGS_FOR_ITEM,
	ERROR_TAGS_FOR_ITEM,

	REQUEST_ITEMS_BY_QUERY,
	RECEIVE_ITEMS_BY_QUERY,
	ERROR_ITEMS_BY_QUERY,

	REQUEST_EXPORT_ITEMS,
	RECEIVE_EXPORT_ITEMS,
	ERROR_EXPORT_ITEMS,

	TOGGLE_MODAL,

	REQUEST_CITE_ITEMS,
	RECEIVE_CITE_ITEMS,
	ERROR_CITE_ITEMS,

	REQUEST_PUBLICATIONS_ITEMS,
	RECEIVE_PUBLICATIONS_ITEMS,
	ERROR_PUBLICATIONS_ITEMS,
} = require('./constants/actions');

const extractItems = (response, state) => {
	return response.getData().map((item, index) => ({
		...item,
		tags: item.tags || [],  // tags are not present on items in my publications
								// but most of the code expects tags key to be present
		[Symbol.for('meta')]: response.getMeta()[index] || {},
		// @TODO: url should not include the key
		[Symbol.for('attachmentUrl')]: item.itemType === 'attachment' &&
			`https://${state.config.apiConfig.apiAuthorityPart}/users/${state.config.userId}/items/${item.key}/file/view?key=${state.config.apiKey}`
	}));
}

// @TODO: rename and move to common/api
const cleanupCacheAfterDelete = (itemKeys, state) => {
	const libraryKey = state.current.library;
	const itemsByCollection = get(state, ['libraries', libraryKey, 'itemsByCollection'], {});
	const itemsByParent = get(state, ['libraries', libraryKey, 'itemsByParent'], {});
	const itemsTop = get(state, ['libraries', libraryKey, 'itemsTop'], []);

	// cleanup relevant caches
	itemKeys.forEach(key => {
		Object.entries(itemsByCollection)
		.forEach(([collectionKey, itemsInCollectionKeys]) => {
			if(itemsInCollectionKeys.includes(key)) {
				api().invalidate({
					'resource.library': libraryKey,
					'resource.collections': collectionKey,
				});
			}
		});

		Object.entries(itemsByParent)
		.forEach(([ parentKey, itemsInParentKeys]) => {
			if(itemsInParentKeys.includes(key)) {
				api().invalidate({
					'resource.library': libraryKey,
					'resource.items': parentKey,
					'resource.children': null
				});
			}
		});

		if(itemsTop.find(topItemKey => topItemKey === key)) {
			api().invalidate({
				'resource.library': libraryKey,
				'resource.items': null,
				'resource.top': null
			});
		}
	});
};

const changeRoute = match => {
	return async (dispatch, getState) => {
		const state = getState();
		const defaultLibrary = `u${state.config.userId}`;

		await dispatch({
			type: ROUTE_CHANGE,
			...match,
			params: {
				...match.params,
				library: match.params.library || defaultLibrary
			}
		});

		const newQuery = getQueryFromRoute(match);
		const oldQuery = state.query;

		if(!deepEqual(newQuery, oldQuery)) {
			await dispatch({ type: QUERY_CHANGE, newQuery, oldQuery });
		}
	}
};

const configureApi = (userId, apiKey, apiConfig = {}) => {
	return {
		type: CONFIGURE_API,
		apiKey,
		userId,
		apiConfig
	};
};

const sortItems = (sortBy, sortDirection) => {
	return {
		type: SORT_ITEMS,
		sortBy,
		sortDirection
	};
};

const postItemsMultiPatch = async (state, multiPatch) => {
	const config = state.config;
	const libraryKey = state.current.library;
	const version = state.libraries[libraryKey].version;
	const response = await api(config.apiKey, config.apiConfig)
		.library(libraryKey)
		.version(version)
		.items()
		.post(multiPatch);

	const items = [];
	const itemKeys = [];
	const itemKeysByCollection = {};
	const itemKeysTop = [];

	multiPatch.forEach((_, index) => {
		try {
			const updatedItem = response.getEntityByIndex(index);
			itemKeys.push(updatedItem.key);
			items.push(updatedItem);
			state.libraries[libraryKey].items[updatedItem.key]
				.collections.forEach(collectionKey => {
					if(!(collectionKey in itemKeysByCollection)) {
						itemKeysByCollection[collectionKey] = [];
					}
					itemKeysByCollection[collectionKey].push(updatedItem.key);
				})

			if(!state.libraries[libraryKey].items[updatedItem.key].parentItem) {
				itemKeysTop.push(updatedItem.key);
			}
		} catch(e) {
			// ignore single-item failure as we're dispatching aggregated ERROR
			// containing all keys that failed to update
		}
	});

	return {
		response,
		items,
		itemKeys,
		itemKeysByCollection,
		itemKeysTop,
	};
}

const preferencesLoad = () => {
	const preferences = {
		...defaultPreferences,
		...JSONTryParse(localStorage.getItem('zotero-web-library-prefs'))
	};

	return {
		type: PREFERENCES_LOAD,
		preferences
	};
}

const preferenceChange = (name, value) => {
	const preferences = {
		...JSONTryParse(localStorage.getItem('zotero-web-library-prefs')),
		[name]: value
	};

	localStorage.setItem('zotero-web-library-prefs', JSON.stringify(preferences));

	return {
		type: PREFERENCE_CHANGE,
		name,
		value
	};
}

const toggleModal = (id, shouldOpen) => {
	return { type: TOGGLE_MODAL, id, shouldOpen }
}

const initialize = () => {
	return async (dispatch, getState) => {
		const { config: apiConfig } = getState();
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

const fetchCollections = (libraryKey, { start = 0, limit = 50, sort = 'dateModified', direction = "desc" } = {}) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_COLLECTIONS_IN_LIBRARY,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});
		try {
			const { config } = getState();
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.get({ start, limit, sort, direction });
			const collections = response.getData();

			dispatch({
				type: RECEIVE_COLLECTIONS_IN_LIBRARY,
				receivedAt: Date.now(),
				libraryKey,
				collections,
				response,
				start,
				limit,
				sort,
				direction,
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

const fetchGroups = libraryKey => {
	return async (dispatch, getState) => {
		const { config } = getState();
		dispatch({
			type: REQUEST_GROUPS,
			libraryKey
		});
		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.groups()
				.get();
			const groups = response.getData();
			groups.sort(
				(a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase())
			);

			dispatch({
				type: RECEIVE_GROUPS,
				libraryKey,
				groups,
				response
			});
			return groups;
		} catch(error) {
			dispatch({
				type: ERROR_GROUPS,
				libraryKey,
				error
			});
			throw error;
		}
	};
};

const fetchItemsInCollection = (collectionKey, { start = 0, limit = 50, sort = 'dateModified', direction = "desc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const libraryKey = state.current.library;
		const totalItemsCount = get(state, ['libraries', libraryKey, 'itemCountByCollection', collectionKey]);
		const knownItemKeys = get(state, ['libraries', libraryKey, 'itemsByCollection', collectionKey], []);

		if(knownItemKeys.length === totalItemsCount) {
			return knownItemKeys.map(key => get(state, ['libraries', libraryKey, 'items', key]))
		}

		dispatch({
			type: REQUEST_ITEMS_IN_COLLECTION,
			libraryKey,
			collectionKey,
			start,
			limit,
			sort,
			direction,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collectionKey)
				.items()
				.top()
				.get({ start, limit, sort, direction });

			const items = extractItems(response, state);

			dispatch({
				type: RECEIVE_ITEMS_IN_COLLECTION,
				libraryKey,
				receivedAt: Date.now(),
				collectionKey,
				items,
				response,
				start,
				limit,
				sort,
				direction,
			});

			return items;
		} catch(error) {
			dispatch({
				type: ERROR_ITEMS_IN_COLLECTION,
				libraryKey,
				collectionKey,
				error
			});

			throw error;
		}
	};
};

const fetchItemsQuery = (query = {}, { start = 0, limit = 50, sort = 'dateModified', direction = "desc" } = {}) => {
	return async (dispatch, getState) => {
		const { collection = null, tag = null, q = null } = query;
		const state = getState();
		const config = state.config;
		const libraryKey = state.current.library;
		// const totalItemsCount = get(state, ['libraries', libraryKey, 'queryItemCount']);
		// const knownItemKeys = get(state, ['libraries', libraryKey, 'queryItems'], []);
		// const previousQuery = get(state, ['libraries', libraryKey, 'query']);
		// const isQueryChanged = !deepEqual(query, previousQuery);

		// if(!isQueryChanged && knownItemKeys.length === totalItemsCount) {
			//@TODO: optimisiation where if all data is available and subset is requested
			//		 that subset is delivered without going back to the server
		// }

		dispatch({
			type: REQUEST_ITEMS_BY_QUERY,
			libraryKey,
			query,
			start,
			limit,
			sort,
			direction,
		});

		try {
			var configuredApi = api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.top();

			if(collection) {
				configuredApi = configuredApi.collections(collection);
			}

			const response = await configuredApi.get({ start, limit, sort, direction, tag, q });
			const items = extractItems(response, state);

			dispatch({
				type: RECEIVE_ITEMS_BY_QUERY,
				libraryKey,
				query,
				items,
				response,
				start,
				limit,
				sort,
				direction,
			});

			return items;
		} catch(error) {
			dispatch({
				type: ERROR_ITEMS_BY_QUERY,
				libraryKey,
				query,
				error,
			});

			throw error;
		}
	};
}

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

const fetchItemTemplate = (itemType, opts = {}) => {
	return async (dispatch, getState) => {
		dispatch({
			type: REQUEST_ITEM_TEMPLATE,
			itemType
		});
		let config = getState().config;
		try {
			let template = (await api(config.apiKey, config.apiConfig).template(itemType).get(opts)).getData();
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
		const state = getState();
		libraryKey = libraryKey || get(getState(), 'current.library');
		dispatch({
			type: REQUEST_CHILD_ITEMS,
			itemKey,
			libraryKey
		});

		try {
			const response = await api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.items(itemKey)
				.children()
				.get();
			const childItems = extractItems(response, state);

			dispatch({
				type: RECEIVE_CHILD_ITEMS,
				itemKey,
				libraryKey,
				childItems,
				response
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

//@TODO: This will fail if itemKeys.length > 50
//@TODO: It probably makes sense to skip itemKeys that already exists in state.items
const fetchItems = (itemKeys, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		libraryKey = libraryKey || get(getState(), 'current.library');
		dispatch({
			type: REQUEST_FETCH_ITEMS,
			itemKeys,
			libraryKey
		});

		try {
			const response = await api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.items()
				.get({
				itemKey: itemKeys.join(',')
			});
			const items = extractItems(response, state);

			dispatch({
				type: RECEIVE_FETCH_ITEMS,
				itemKeys,
				libraryKey,
				items,
				response
			});
		} catch(error) {
			dispatch({
				type: ERROR_FETCH_ITEMS,
				error,
				itemKeys,
				libraryKey
			});
		}
	};
};

const fetchTopItems = ({ start = 0, limit = 50, sort = 'dateModified', direction = 'desc' } = {}) => {
	return async (dispatch, getState, ) => {
		const state = getState();
		const libraryKey = state.current.library;
		const totalItemsCount = get(state, ['itemCountTopByLibrary', libraryKey]);
		const knownItemKeys = get(state, ['libraries', libraryKey, 'itemsTop'], []);

		if(knownItemKeys.length === totalItemsCount) {
			// there is no need for a request
			return knownItemKeys.map(key => get(state, ['libraries', libraryKey, 'items', key]))
		}

		dispatch({
			type: REQUEST_TOP_ITEMS,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});

		try {
			const response = await api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.items()
				.top()
				.get({ start, limit, sort, direction });
			const items = extractItems(response, state);

			dispatch({
				type: RECEIVE_TOP_ITEMS,
				libraryKey,
				items,
				response,
				start,
				limit,
				sort,
				direction,
			});
			return items;
		} catch(error) {
			dispatch({
				type: ERROR_TOP_ITEMS,
				error,
				libraryKey
			});
		}
	};
};

const fetchTrashItems = ({ start = 0, limit = 50, sort = 'dateModified', direction = 'desc' } = {}) => {
	return async (dispatch, getState, ) => {
		const state = getState();
		const libraryKey = state.current.library;
		const totalItemsCount = get(state, ['itemCountTrashByLibrary', libraryKey]);
		const knownItemKeys = get(state, ['libraries', libraryKey, 'itemsTrash'], []);

		if(knownItemKeys.length === totalItemsCount) {
			// there is no need for a request
			return knownItemKeys.map(key => get(state, ['libraries', libraryKey, 'items', key]))
		}

		dispatch({
			type: REQUEST_TRASH_ITEMS,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});

		try {
			const response = await api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.items()
				.trash()
				.get({ start, limit, sort, direction });
			const items = extractItems(response, state);

			dispatch({
				type: RECEIVE_TRASH_ITEMS,
				libraryKey,
				items,
				response,
				start,
				limit,
				sort,
				direction,
			});
			return items;
		} catch(error) {
			dispatch({
				type: ERROR_TRASH_ITEMS,
				error,
				libraryKey,
				start,
				limit,
				sort,
				direction,
			});
		}
	};
};

const fetchPublicationsItems = ({ start = 0, limit = 50, sort = 'dateModified', direction = 'desc' } = {}) => {
	return async (dispatch, getState, ) => {
		const state = getState();
		const libraryKey = state.config.userLibraryKey;
		const totalItemsCount = state.itemCount.publications;
		const knownItemKeys = state.itemsPublications;

		if(knownItemKeys.length === totalItemsCount) {
			// there is no need for a request
			return knownItemKeys.map(key => get(state, ['libraries', libraryKey, 'items', key]))
		}

		dispatch({
			type: REQUEST_PUBLICATIONS_ITEMS,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});

		try {
			const response = await api(state.config.apiKey, state.config.apiConfig)
				.library(libraryKey)
				.publications()
				.items()
				.get({ start, limit, sort, direction });
			const items = extractItems(response, state);

			dispatch({
				type: RECEIVE_PUBLICATIONS_ITEMS,
				libraryKey,
				items,
				response,
				start,
				limit,
				sort,
				direction,
			});
			return items;
		} catch(error) {
			dispatch({
				type: ERROR_PUBLICATIONS_ITEMS,
				error,
				libraryKey,
				start,
				limit,
				sort,
				direction,
			});
		}
	};
};

const triggerEditingItem = (itemKey, isEditing) => {
	return async (dispatch, getState) => {
		let libraryKey = get(getState(), 'current.library');

		return dispatch({
			type: TRIGGER_EDITING_ITEM,
			itemKey,
			libraryKey,
			isEditing
		});
	}
};

const triggerResizeViewport = (width, height) => {
	return {
		type: TRIGGER_RESIZE_VIEWPORT,
		width,
		height
	};
};

function createItems(items, libraryKey) {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_CREATE_ITEMS,
			libraryKey,
			items
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.post(items);

			if(!response.isSuccess()) {
				throw response.getErrors();
			}

			const createdItems = extractItems(response, state);

			dispatch({
				type: RECEIVE_CREATE_ITEMS,
				libraryKey,
				items: createdItems,
				response
			});

			api().invalidate({ 'resource.library': libraryKey });

			return response.getData();
		} catch(error) {
			dispatch({
					type: ERROR_CREATE_ITEMS,
					error,
					libraryKey,
					items,
				});
			throw error;
		}
	};
}

function createItem(properties, libraryKey) {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;

		dispatch({
			type: REQUEST_CREATE_ITEM,
			libraryKey,
			properties
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.post([properties]);

			if(!response.isSuccess()) {
				throw response.getErrors()[0];
			}

			const item = {
				...response.getEntityByIndex(0),
				[Symbol.for('meta')]: response.getMeta()[0] || {}
			};

			dispatch({
				type: RECEIVE_CREATE_ITEM,
				libraryKey,
				item,
				response
			});
			if(properties.parentItem) {
				api().invalidate({
					'resource.items': properties.parentItem,
					'resource.children': null
				});
			}
			return response.getEntityByIndex(0);
		} catch(error) {
			dispatch({
					type: ERROR_CREATE_ITEM,
					error,
					libraryKey,
					properties,
				});
			throw error;
		}
	};
}

function deleteItem(item) {
	return async (dispatch, getState) => {
		const state = getState();
		const libraryKey = get(getState(), 'current.library');
		const config = getState().config;

		dispatch({
			type: REQUEST_DELETE_ITEM,
			libraryKey,
			item
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items(item.key)
				.version(item.version)
				.delete();

			dispatch({
				type: RECEIVE_DELETE_ITEM,
				libraryKey,
				item,
				response
			});
			cleanupCacheAfterDelete([item.key], state);
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

function deleteItems(itemKeys) {
	return async (dispatch, getState) => {
		const state = getState();
		const libraryKey = get(getState(), 'current.library');
		const { config } = getState(state);

		dispatch({
			type: REQUEST_DELETE_ITEMS,
			libraryKey,
			itemKeys
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.delete(itemKeys);

			dispatch({
				type: RECEIVE_DELETE_ITEMS,
				libraryKey,
				itemKeys,
				response
			});

			cleanupCacheAfterDelete(itemKeys, state);
		} catch(error) {
			dispatch({
					type: ERROR_DELETE_ITEMS,
					error,
					libraryKey,
					itemKeys,
				});
			throw error;
		}
	};
}

function updateItem(itemKey, patch) {
	return async (dispatch, getState) => {
		const libraryKey = get(getState(), 'current.library');
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
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const libraryKey = state.current.library;
			const config = state.config;
			const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
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

				// invalidate child items for any collection of this item
				if(updatedItem.collections) {
					for(var collectionKey of updatedItem.collections) {
						api().invalidate({
							'resource.collections': collectionKey,
							'resource.items': null
						});
					}
				}

				// invalidate child items for the parent of this item
				if(updatedItem.parentItem) {
					api().invalidate({
						'resource.items': updatedItem.parentItem,
						'resource.children': null
					});
				}

				// invalidate this item
				api().invalidate('resource.items', itemKey);

				// invalidate top items of this library
				api().invalidate({
					'resource.library': libraryKey,
					'resource.items': null,
					'resource.top': null
				});

				dispatch({
					type: RECEIVE_UPDATE_ITEM,
					item: updatedItem,
					itemKey,
					libraryKey,
					patch,
					queueId,
					response
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

function uploadAttachment(itemKey, fileData) {
	return async (dispatch, getState) => {
		const state = getState();
		const libraryKey = get(getState(), 'current.library');
		const config = state.config;
		dispatch({
			type: REQUEST_UPLOAD_ATTACHMENT,
			libraryKey,
			itemKey,
			fileData,
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items(itemKey)
				.attachment(fileData.fileName, fileData.file)
				.post();

			dispatch({
				type: RECEIVE_UPLOAD_ATTACHMENT,
				libraryKey,
				itemKey,
				fileData,
				response,
			});
		} catch(error) {
			dispatch({
				type: ERROR_UPLOAD_ATTACHMENT,
				libraryKey,
				itemKey,
				fileData,
				error,
			});
			throw error;
		}
	};
}

function moveToTrash(itemKeys) {
	return async (dispatch, getState) => {
		const libraryKey = getState().current.library;
		const queueId = ++queueIdCunter;

		dispatch({
			type: PRE_MOVE_ITEMS_TRASH,
			itemKeys,
			libraryKey,
			queueId
		});

		dispatch(
			queueMoveItemsToTrash(itemKeys, libraryKey, queueId)
		);
	};
}

function queueMoveItemsToTrash(itemKeys, libraryKey, queueId) {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => ({ key, deleted: 1 }));

			dispatch({
				type: REQUEST_MOVE_ITEMS_TRASH,
				itemKeys,
				libraryKey,
				queueId
			});

			try {
				const { response, itemKeys, ...itemsData } = await postItemsMultiPatch(state, multiPatch);

				dispatch({
					type: RECEIVE_MOVE_ITEMS_TRASH,
					libraryKey,
					response,
					queueId,
					itemKeys,
					...itemsData,
				});

				if(!response.isSuccess()) {
					dispatch({
						type: ERROR_MOVE_ITEMS_TRASH,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						queueId
					});
				}

				// @TODO: more targeted cache invalidation
				api().invalidate({ 'resource.library': libraryKey });
				return;
			} catch(error) {
				dispatch({
					type: ERROR_MOVE_ITEMS_TRASH,
					error,
					itemKeys,
					libraryKey,
					queueId
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

function recoverFromTrash(itemKeys) {
	return async (dispatch, getState) => {
		const libraryKey = getState().current.library;
		const queueId = ++queueIdCunter;

		dispatch({
			type: PRE_RECOVER_ITEMS_TRASH,
			itemKeys,
			libraryKey,
			queueId
		});

		dispatch(
			queueRecoverItemsFromTrash(itemKeys, libraryKey, queueId)
		);
	};
}

function queueRecoverItemsFromTrash(itemKeys, libraryKey, queueId) {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => ({ key, deleted: 0 }));

			dispatch({
				type: REQUEST_RECOVER_ITEMS_TRASH,
				itemKeys,
				libraryKey,
				queueId
			});

			try {
				const { response, itemKeys, ...itemsData } = await postItemsMultiPatch(state, multiPatch);

				dispatch({
					type: RECEIVE_RECOVER_ITEMS_TRASH,
					libraryKey,
					response,
					queueId,
					itemKeys,
					...itemsData,
				});

				if(!response.isSuccess()) {
					dispatch({
						type: ERROR_RECOVER_ITEMS_TRASH,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						queueId
					});
				}

				// @TODO: more targeted cache invalidation
				api().invalidate({ 'resource.library': libraryKey });
				return;
			} catch(error) {
				dispatch({
					type: ERROR_RECOVER_ITEMS_TRASH,
					error,
					itemKeys,
					libraryKey,
					queueId
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

function addToCollection(itemKeys, collectionKey, targetLibraryKey) {
	return async (dispatch, getState) => {
		const currentLibraryKey = getState().current.library;
		const queueId = ++queueIdCunter;

		dispatch({
				type: PRE_ADD_ITEMS_TO_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey: targetLibraryKey,
				queueId
			});

		if(currentLibraryKey === targetLibraryKey) {
			dispatch(
				queueAddToCollection(itemKeys, collectionKey, currentLibraryKey, queueId)
			);
		} else {
			dispatch(
				createItems(
					itemKeys.map(ik => ({
							...removeKeys(
								getState().libraries[currentLibraryKey].items[ik],
								['key', 'version']
							),
							collections: [collectionKey]
						})
					), targetLibraryKey
				)
			);
		}
	};
}

function queueAddToCollection(itemKeys, collectionKey, libraryKey, queueId) {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => {
				const item = state.libraries[libraryKey].items[key];
				return {
					key,
					collections: [
						...(new Set([
							...(item.collections || []),
							collectionKey
						]))
					]
				};
			});

			dispatch({
				type: REQUEST_ADD_ITEMS_TO_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey,
				queueId
			});

			try {
				const { response, itemKeys, items } = await postItemsMultiPatch(state, multiPatch);
				const itemKeysChanged = Object.values(response.raw.success);

				dispatch({
					type: RECEIVE_ADD_ITEMS_TO_COLLECTION,
					libraryKey,
					itemKeys,
					itemKeysChanged,
					collectionKey,
					items,
					response,
					queueId,
				});

				if(!response.isSuccess()) {
					dispatch({
						type: ERROR_ADD_ITEMS_TO_COLLECTION,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						collectionKey,
						queueId
					});
				}

				// @TODO: more targeted cache invalidation
				api().invalidate({ 'resource.library': libraryKey });
				return;
			} catch(error) {
				dispatch({
					type: ERROR_ADD_ITEMS_TO_COLLECTION,
					error,
					itemKeys,
					libraryKey,
					queueId
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const createCollection = (properties, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		dispatch({
			type: REQUEST_CREATE_COLLECTION,
			libraryKey,
			properties
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections()
				.post([properties]);

			if(!response.isSuccess()) {
				throw response.getErrors()[0];
			}

			const collection = {
				...response.getEntityByIndex(0)
			};

			dispatch({
				type: RECEIVE_CREATE_COLLECTION,
				libraryKey,
				collection,
				response
			});
			api().invalidate({
				'resource.collections': null,
			});
			return response.getEntityByIndex(0);
		} catch(error) {
			dispatch({
					type: ERROR_CREATE_COLLECTION,
					error,
					libraryKey,
					properties,
				});
			throw error;
		}
	};
}

function updateCollection(collectionKey, patch, libraryKey) {
	return async dispatch => {
		const queueId = ++queueIdCunter;

		dispatch({
			type: PRE_UPDATE_COLLECTION,
			collectionKey,
			libraryKey,
			patch,
			queueId
		});

		dispatch(
			queueUpdateCollection(collectionKey, patch, libraryKey, queueId)
		);
	};
}

function queueUpdateCollection(collectionKey, patch, libraryKey, queueId) {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;
			const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
			const version = collection.version;

			dispatch({
				type: REQUEST_UPDATE_COLLECTION,
				collectionKey,
				libraryKey,
				patch,
				queueId
			});

			try {
				const response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.collections(collectionKey)
					.version(version)
					.patch(patch);

				const updatedCollection = {
					...collection,
					...response.getData()
				};

				// @TODO: can this be more specific?
				// We need to invalidate list of collections in this library
				api().invalidate({ 'resource.library': libraryKey });

				dispatch({
					type: RECEIVE_UPDATE_COLLECTION,
					collection: updatedCollection,
					collectionKey,
					libraryKey,
					patch,
					queueId,
					response
				});

				return updateCollection;
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_COLLECTION,
					error,
					collectionKey,
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

const deleteCollection = (collection, libraryKey) => {
	return async (dispatch, getState) => {
		const config = getState().config;

		dispatch({
			type: REQUEST_DELETE_COLLECTION,
			libraryKey,
			collection
		});

		try {
			let response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collection.key)
				.version(collection.version)
				.delete();

			api().invalidate({ 'resource.library': libraryKey });

			dispatch({
				type: RECEIVE_DELETE_COLLECTION,
				libraryKey,
				collection,
				response
			});
		} catch(error) {
			dispatch({
					type: ERROR_DELETE_COLLECTION,
					error,
					libraryKey,
					collection,
				});
			throw error;
		}
	};
}

const fetchLibrarySettings = () => {
	return async (dispatch, getState) => {
		const { config, current: { library: libraryKey } } = getState();
		dispatch({
			type: REQUEST_LIBRARY_SETTINGS,
			libraryKey
		});
		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.settings()
				.get();

			const settings = response.getData();

			dispatch({
				type: RECEIVE_LIBRARY_SETTINGS,
				libraryKey,
				settings,
				response
			});
			return settings;
		} catch(error) {
			dispatch({
				type: ERROR_LIBRARY_SETTINGS,
				libraryKey,
				error
			});
			throw error;
		}
	};
}

const fetchTagsInCollection = (collectionKey, { start = 0, limit = 50, sort = 'title', direction = "asc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const libraryKey = state.current.library;
		const totalTagsCount = get(state, ['libraries', libraryKey, 'tagsCountByCollection', collectionKey]);
		const knownTags = get(state, ['libraries', libraryKey, 'tagsByCollection', collectionKey], []);

		if(knownTags.length === totalTagsCount) {
			return knownTags.map(key => get(state, ['libraries', libraryKey, 'tags', key]))
		}

		dispatch({
			type: REQUEST_TAGS_IN_COLLECTION,
			libraryKey,
			start,
			limit,
			sort,
			direction,
			collectionKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.collections(collectionKey)
				.tags()
				.get({ start, limit, sort, direction });

			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));

			dispatch({
				type: RECEIVE_TAGS_IN_COLLECTION,
				libraryKey,
				collectionKey,
				tags,
				response,
				start,
				limit,
			});

			return tags;
		} catch(error) {
			dispatch({
				type: ERROR_TAGS_IN_COLLECTION,
				libraryKey,
				collectionKey,
				error,
				start,
				limit,
			});

			throw error;
		}
	};
};

const fetchTagsInLibrary = ({ start = 0, limit = 50, sort = 'title', direction = "asc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const libraryKey = state.current.library;
		const totalTagsCount = state.tagsCountByLibrary;
		const knownTags = get(state, ['tagsByLibrary', libraryKey], []);

		if(knownTags.length === totalTagsCount) {
			return knownTags.map(key => get(state, ['libraries', libraryKey, 'tags', key]))
		}

		dispatch({
			type: REQUEST_TAGS_IN_LIBRARY,
			libraryKey,
			start,
			limit,
			sort,
			direction,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.tags()
				.get({ start, limit, sort, direction });

			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));

			dispatch({
				type: RECEIVE_TAGS_IN_LIBRARY,
				libraryKey,
				tags,
				response,
				start, limit, sort, direction
			});

			return tags;
		} catch(error) {
			dispatch({
				type: ERROR_TAGS_IN_LIBRARY,
				libraryKey,
				error,
				start, limit, sort, direction
			});

			throw error;
		}
	};
};

const fetchTagsForItem = (itemKey, { start = 0, limit = 50, sort = 'title', direction = "asc" } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const libraryKey = state.current.library;
		const totalTagsCount = get(state, ['libraries', libraryKey, 'tagsCountByItem', itemKey]);
		const knownTags = get(state, ['libraries', libraryKey, 'tagsByItem', itemKey], []);

		if(knownTags.length === totalTagsCount) {
			return knownTags.map(key => get(state, ['libraries', libraryKey, 'tags', key]))
		}

		dispatch({
			type: REQUEST_TAGS_FOR_ITEM,
			libraryKey,
			itemKey,
			start,
			limit,
			sort,
			direction,

		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items(itemKey)
				.tags()
				.get({ start, limit, sort, direction });

			const tags = response.getData().map((tagData, index) => ({
				tag: tagData.tag,
				[Symbol.for('meta')]: response.getMeta()[index] || {}
			}));

			dispatch({
				type: RECEIVE_TAGS_FOR_ITEM,
				libraryKey,
				itemKey,
				tags,
				response,
				start,
				limit,
			});

			return tags;
		} catch(error) {
			dispatch({
				type: ERROR_TAGS_FOR_ITEM,
				libraryKey,
				itemKey,
				error,
				start,
				limit,
			});

			throw error;
		}
	};
};

const exportItems = (itemKeys, format) => {
	return async (dispatch, getState) => {
		let { config, current: { library: libraryKey } } = getState();

		dispatch({
			type: REQUEST_EXPORT_ITEMS,
			itemKeys,
			libraryKey
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({ itemKey: itemKeys.join(','), format });

			const exportData = await response.response.blob();

			dispatch({
				type: RECEIVE_EXPORT_ITEMS,
				itemKeys,
				libraryKey,
				exportData,
				response
			});

			return exportData;
		} catch(error) {
			dispatch({
				type: ERROR_EXPORT_ITEMS,
				error,
				itemKeys,
				libraryKey
			});
		}
	};
};

const citeItems = (itemKeys, style = 'chicago-note-bibliography') => {
	return async (dispatch, getState) => {
		let { config, current: { library: libraryKey } } = getState();

		dispatch({
			type: REQUEST_CITE_ITEMS,
			itemKeys,
			libraryKey,
			style,
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.get({
					itemKey: itemKeys.join(','),
					include: 'citation',
					style
				});

			const citations = await response.getData().map(d => d.citation)

			dispatch({
				type: RECEIVE_CITE_ITEMS,
				itemKeys,
				libraryKey,
				citations,
				response,
			});

			return citations;
		} catch(error) {
			dispatch({
				type: ERROR_CITE_ITEMS,
				error,
				itemKeys,
				libraryKey,
			});
		}
	};
};

module.exports = {
	addToCollection,
	changeRoute,
	citeItems,
	configureApi,
	createCollection,
	createItem,
	deleteCollection,
	deleteItem,
	deleteItems,
	exportItems,
	fetchChildItems,
	fetchCollections,
	fetchGroups,
	fetchItems,
	fetchItemsInCollection,
	fetchItemsQuery,
	fetchItemTemplate,
	fetchItemTypeCreatorTypes,
	fetchItemTypeFields,
	fetchLibrarySettings,
	fetchPublicationsItems,
	fetchTagsForItem,
	fetchTagsInCollection,
	fetchTagsInLibrary,
	fetchTopItems,
	fetchTrashItems,
	initialize,
	moveToTrash,
	preferenceChange,
	preferencesLoad,
	recoverFromTrash,
	sortItems,
	toggleModal,
	triggerEditingItem,
	triggerResizeViewport,
	updateCollection,
	updateItem,
	uploadAttachment,
};

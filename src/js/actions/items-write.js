import api from 'zotero-api-client';

import { extractItems } from '../common/actions';
import { fetchItemsByKeys, fetchChildItems, fetchItemTemplate, fetchItemTypeCreatorTypes } from '.';
import { fetchItemTypeFields } from './meta';
import { fetchLibrarySettings, requestTracker } from '.';
import { get, getItemCanonicalUrl, getUniqueId, removeRelationByItemKey, reverseMap } from '../utils';
import { getFilesData } from '../common/event';
import { getToggledTags, TOGGLE_ADD, TOGGLE_REMOVE, TOGGLE_TOGGLE } from '../common/tags';
import { omit } from '../common/immutable';
import { parseDescriptiveString } from '../common/format';
import { sniffForMIMEType } from '../common/mime';
import baseMappings from '../../../data/mappings';

import {
	BEGIN_ONGOING,
	COMPLETE_ONGOING,
	ERROR_ADD_ITEMS_TO_COLLECTION,
	ERROR_ADD_TAGS_TO_ITEMS,
	ERROR_CREATE_ITEM,
	ERROR_CREATE_ITEMS,
	ERROR_DELETE_ITEM,
	ERROR_DELETE_ITEMS,
	ERROR_MOVE_ITEMS_TRASH,
	ERROR_RECOVER_ITEMS_TRASH,
	ERROR_REGISTER_FILE_ATTACHMENTS,
	ERROR_REMOVE_ITEMS_FROM_COLLECTION,
	ERROR_STORE_RELATIONS_IN_SOURCE,
	ERROR_UPDATE_ITEM,
	ERROR_UPLOAD_ATTACHMENT,
	PRE_ADD_ITEMS_TO_COLLECTION,
	PRE_ADD_TAGS_TO_ITEMS,
	PRE_MOVE_ITEMS_TRASH,
	PRE_RECOVER_ITEMS_TRASH,
	PRE_REMOVE_ITEMS_FROM_COLLECTION,
	PRE_STORE_RELATIONS_IN_SOURCE,
	PRE_UPDATE_ITEM,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_REGISTER_FILE_ATTACHMENTS,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_STORE_RELATIONS_IN_SOURCE,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_UPLOAD_ATTACHMENT,
	REQUEST_ADD_ITEMS_TO_COLLECTION,
	REQUEST_ADD_TAGS_TO_ITEMS,
	REQUEST_CREATE_ITEM,
	REQUEST_CREATE_ITEMS,
	REQUEST_DELETE_ITEM,
	REQUEST_DELETE_ITEMS,
	REQUEST_MOVE_ITEMS_TRASH,
	REQUEST_RECOVER_ITEMS_TRASH,
	REQUEST_REGISTER_FILE_ATTACHMENTS,
	REQUEST_REMOVE_ITEMS_FROM_COLLECTION,
	REQUEST_STORE_RELATIONS_IN_SOURCE,
	REQUEST_UPDATE_ITEM,
	REQUEST_UPLOAD_ATTACHMENT,
} from '../constants/actions';


const postItemsMultiPatch = async (state, multiPatch) => {
	const config = state.config;
	const { libraryKey } = state.current;
	const version = state.libraries[libraryKey].sync.version;
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

const createItems = (items, libraryKey) => {
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

			//@TODO: refactor
			const otherItems = state.libraries[libraryKey] ? state.libraries[libraryKey].items : [];

			dispatch({
				type: RECEIVE_CREATE_ITEMS,
				libraryKey,
				items: createdItems,
				otherItems,
				response
			});

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

const createItem = (properties, libraryKey) => {
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
				[Symbol.for('meta')]: response.getMeta()[0] || {},
				[Symbol.for('links')]: response.getLinks()[0] || {}
			};

			dispatch({
				type: RECEIVE_CREATE_ITEM,
				libraryKey,
				item,
				otherItems: state.libraries[libraryKey].items,
				response
			});
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

const deleteItem = item => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
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
				otherItems: state.libraries[libraryKey].items,
				response
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

const deleteItems = itemKeys => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const { config } = state;
		const items = itemKeys.map(ik => state.libraries[libraryKey].items[ik]);

		dispatch({
			type: REQUEST_DELETE_ITEMS,
			libraryKey,
			itemKeys,
			items
		});

		try {
			const response = await api(config.apiKey, config.apiConfig)
				.library(libraryKey)
				.items()
				.delete(itemKeys);

			dispatch({
				itemKeys,
				items,
				libraryKey,
				otherItems: state.libraries[libraryKey].items,
				response,
				type: RECEIVE_DELETE_ITEMS,
			});
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

const updateItem = (itemKey, patch) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_UPDATE_ITEM,
			itemKey,
			libraryKey,
			patch,
			id
		});

		dispatch(
			queueUpdateItem(itemKey, patch, libraryKey, id)
		);
	};
}

const queueUpdateItem = (itemKey, patch, libraryKey, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const { libraryKey } = state.current;
			const config = state.config;
			const item = get(state, ['libraries', libraryKey, 'items', itemKey]);
			const itemVersion = item.version;
			const libraryVersion = state.libraries[libraryKey].sync.version;

			dispatch({
				type: REQUEST_UPDATE_ITEM,
				itemKey,
				libraryKey,
				patch,
				id
			});

			try {
				var updatedItem, response;

				//@NOTE: When updating 'creators' or 'date' we send update using
				//		 multi POST in order to get update meta data. Otherwise
				//		 we use simple PATCH.
				if('creators' in patch || 'date' in patch) {
					response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.version(libraryVersion)
					.items()
					.post([{
						key: itemKey,
						...patch
					}]);

					updatedItem = {
						...item,
						...response.getEntityByIndex(0),
						[Symbol.for('meta')]: response.getMeta()[0]
					};
				} else {
					response = await api(config.apiKey, config.apiConfig)
						.library(libraryKey)
						.items(itemKey)
						.version(itemVersion)
						.patch(patch);
					updatedItem = {
						...item,
						...response.getData()
					}
				}

				dispatch({
					type: RECEIVE_UPDATE_ITEM,
					item: updatedItem,
					itemKey,
					libraryKey,
					patch,
					id,
					response,
					otherItems: state.libraries[libraryKey].items,
				});

				return updatedItem;
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_ITEM,
					error,
					itemKey,
					libraryKey,
					patch,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const uploadAttachment = (itemKey, fileData, libraryKey) => {
	return async (dispatch, getState) => {
		const state = getState();
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

const moveToTrash = itemKeys => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_MOVE_ITEMS_TRASH,
			itemKeys,
			libraryKey,
			id
		});

		dispatch(
			queueMoveItemsToTrash(itemKeys, libraryKey, id)
		);
	};
}

const queueMoveItemsToTrash = (itemKeys, libraryKey, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => ({ key, deleted: 1 }));

			dispatch({
				type: REQUEST_MOVE_ITEMS_TRASH,
				itemKeys,
				libraryKey,
				id
			});

			try {
				const { response, itemKeys, ...itemsData } = await postItemsMultiPatch(state, multiPatch);

				const affectedParentItemKeys = itemKeys
					.map(ik => get(state, ['libraries', libraryKey, 'items', ik, 'parentItem']))
					.filter(Boolean);

				if(response.isSuccess()) {
					dispatch({
						type: RECEIVE_MOVE_ITEMS_TRASH,
						libraryKey,
						response,
						id,
						itemKeys,
						...itemsData,
						otherItems: state.libraries[libraryKey].items,
					});

					if(affectedParentItemKeys.length > 0) {
						dispatch(fetchItemsByKeys(affectedParentItemKeys));
					}
				} else {
					dispatch({
						type: ERROR_MOVE_ITEMS_TRASH,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						id
					});
				}

				return;
			} catch(error) {
				dispatch({
					type: ERROR_MOVE_ITEMS_TRASH,
					error,
					itemKeys,
					libraryKey,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const recoverFromTrash = itemKeys => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_RECOVER_ITEMS_TRASH,
			itemKeys,
			libraryKey,
			id
		});

		dispatch(
			queueRecoverItemsFromTrash(itemKeys, libraryKey, id)
		);
	};
}

const queueRecoverItemsFromTrash = (itemKeys, libraryKey, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => ({ key, deleted: 0 }));

			dispatch({
				type: REQUEST_RECOVER_ITEMS_TRASH,
				itemKeys,
				libraryKey,
				id
			});

			try {
				const { response, itemKeys, ...itemsData } = await postItemsMultiPatch(state, multiPatch);

				const affectedParentItemKeys = itemKeys
					.map(ik => get(state, ['libraries', libraryKey, 'items', ik, 'parentItem']))
					.filter(Boolean);

				if(response.isSuccess()) {
					dispatch({
						type: RECEIVE_RECOVER_ITEMS_TRASH,
						libraryKey,
						response,
						id,
						itemKeys,
						...itemsData,
						otherItems: state.libraries[libraryKey].items,
					});
					if(affectedParentItemKeys.length > 0) {
						dispatch(fetchItemsByKeys(affectedParentItemKeys));
					}
				} else {
					dispatch({
						type: ERROR_RECOVER_ITEMS_TRASH,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						id
					});
				}

				return;
			} catch(error) {
				dispatch({
					type: ERROR_RECOVER_ITEMS_TRASH,
					error,
					itemKeys,
					libraryKey,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}


const addTagsOnItems = (itemKeys, libraryKey, tagsToToggle) =>
	toggleTagsOnItems(itemKeys, libraryKey, tagsToToggle, TOGGLE_ADD)
const removeTagsOnItems = (itemKeys, libraryKey, tagsToToggle) =>
	toggleTagsOnItems(itemKeys, libraryKey, tagsToToggle, TOGGLE_REMOVE)

const toggleTagsOnItems = (itemKeys, libraryKey, tagsToToggle, toggleAction = TOGGLE_TOGGLE) => {
	return async dispatch => {
		const id = requestTracker.id++;

		dispatch({
			type: PRE_ADD_TAGS_TO_ITEMS,
			itemKeys,
			libraryKey,
			tagsToToggle,
			toggleAction,
			id
		});

		dispatch(
			queueToggleTagOnItems(itemKeys, libraryKey, tagsToToggle, toggleAction, id)
		);
	};
}

const queueToggleTagOnItems = (itemKeys, libraryKey, tagsToToggle, toggleAction, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => ({
				key,
				tags: getToggledTags(state.libraries[libraryKey].items[key].tags.map(t => t.tag), tagsToToggle, toggleAction)
					.map(tag => ({ tag }))
			}));

			dispatch({
				type: REQUEST_ADD_TAGS_TO_ITEMS,
				itemKeys,
				tagsToToggle,
				libraryKey,
				id
			});

			try {
				const { response, itemKeys, items } = await postItemsMultiPatch(state, multiPatch);
				const itemKeysChanged = Object.values(response.raw.success);

				if(response.isSuccess()) {
					dispatch({
						type: RECEIVE_ADD_TAGS_TO_ITEMS,
						libraryKey,
						itemKeys,
						itemKeysChanged,
						tagsToToggle,
						items,
						response,
						id,
						// otherItems: state.libraries[libraryKey].items,
					});
				} else {
					dispatch({
						type: ERROR_ADD_TAGS_TO_ITEMS,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						tagsToToggle,
						id
					});
				}

				return;
			} catch(error) {
				dispatch({
					type: ERROR_ADD_TAGS_TO_ITEMS,
					error,
					itemKeys,
					libraryKey,
					tagsToToggle,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const addToCollection = (itemKeys, collectionKey) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const id = requestTracker.id++;

		await dispatch({
				type: PRE_ADD_ITEMS_TO_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey,
				id
			});
		await dispatch(
			queueAddToCollection(itemKeys, collectionKey, libraryKey, id)
		);
	};
}

const queueAddToCollection = (itemKeys, collectionKey, libraryKey, id) => {
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
				id
			});

			try {
				const { response, itemKeys, items } = await postItemsMultiPatch(state, multiPatch);
				const itemKeysChanged = Object.values(response.raw.success);

				if(response.isSuccess()) {
					dispatch({
						type: RECEIVE_ADD_ITEMS_TO_COLLECTION,
						libraryKey,
						itemKeys,
						itemKeysChanged,
						collectionKey,
						items,
						response,
						id,
						otherItems: state.libraries[libraryKey].items,
					});
				} else {
					dispatch({
						type: ERROR_ADD_ITEMS_TO_COLLECTION,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						collectionKey,
						id
					});
				}

				return;
			} catch(error) {
				dispatch({
					type: ERROR_ADD_ITEMS_TO_COLLECTION,
					error,
					itemKeys,
					libraryKey,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const copyToLibrary = (itemKeys, sourceLibraryKey, targetLibraryKey, targetCollectionKeys = [], extraProperties = {}) => {
	if(!Array.isArray(targetCollectionKeys)) {
		if(targetCollectionKeys === null) {
			targetCollectionKeys = [];
		} else {
			targetCollectionKeys = [targetCollectionKeys];
		}
	}

	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const { libraries } = state.config;

		const sourceLibrary = libraries.find(l => l.key === sourceLibraryKey);
		const targetLibrary = libraries.find(l => l.key === targetLibraryKey);


		// If one of the libraries is a personal library, store the relation with that item, whether
		// source or target, pointing to the URI of the other item. If both are groups, store the
		// relation on the new, copied item, since that's what the user definitely has access to.
		var shouldStoreRelationInSource;

		if(!sourceLibrary.isMyLibrary && !targetLibrary.isMyLibrary) {
			shouldStoreRelationInSource = false;
		} else {
			if(sourceLibrary.isMyLibrary) {
				shouldStoreRelationInSource = true;
			} else {
				shouldStoreRelationInSource = false;
			}
		}

		// ensure we have config of the target library. See #441
		if(get(state, ['libraries', targetLibraryKey, 'tagColors', 'lookup'], null) === null) {
			await dispatch(fetchLibrarySettings(targetLibraryKey));
		}

		const newItems = await dispatch(
			createItems(
				itemKeys.map(ik => {
					const sourceItem = state.libraries[sourceLibraryKey].items[ik];
					const newRelations = shouldStoreRelationInSource ? sourceItem.relations : {
							...sourceItem.relations,
							'owl:sameAs': getItemCanonicalUrl({ libraryKey: sourceLibraryKey, itemKey: sourceItem.key })
						};
					return {
						...omit(sourceItem, ['key', 'version', 'collections', 'deleted', 'dateAdded', 'dateModified']),
						...extraProperties,
						collections: targetCollectionKeys,
						relations: newRelations
					};
				}), targetLibraryKey
			)
		);

		if(shouldStoreRelationInSource) {
			const targetItemKeys = newItems.map(i => i.key);
			dispatch(storeRelationInSoruce(itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey));
		}

		const registerUploadsPromises = newItems.map(async (newItem, index) => {
			if(newItem.itemType !== 'attachment') {
				return Promise.resolve();
			}
			const oldItem = state.libraries[sourceLibraryKey].items[itemKeys[index]];

			const { mtime, md5, filename } = oldItem;
			const fileSize = oldItem?.[Symbol.for('links')]?.enclosure?.length;

			if(!mtime || !md5 || !filename || !fileSize) {
				return Promise.resolve();
			}

			return await api(config.apiKey, config.apiConfig)
				.library(targetLibraryKey)
				.items(newItem.key)
				.registerAttachment(filename, fileSize, mtime, md5)
				.post();
		}).filter(Boolean);

		dispatch({
			type: REQUEST_REGISTER_FILE_ATTACHMENTS,
			libraryKey: targetLibraryKey,
		});

		try {
			const responses = (await Promise.all(registerUploadsPromises)).filter(Boolean);
			responses.sort((a, b) => a.getVersion() - b.getVersion());

			dispatch({
				type: RECEIVE_REGISTER_FILE_ATTACHMENTS,
				libraryKey: targetLibraryKey,
				responses
			});
		} catch(error) {
			dispatch({
				type: ERROR_REGISTER_FILE_ATTACHMENTS,
				libraryKey: targetLibraryKey,
				error
			});
			throw error;
		}

		const childItemsCopyPromises = itemKeys.map(async (ik, index) => {
			const newItem = newItems[index];
			const canHaveChildItems = !['attachment', 'note'].includes(newItem.itemType);
			if(!canHaveChildItems) {
				return [];
			}
			await dispatch(fetchChildItems(ik, { start: 0, limit: 100 }, { current: { libraryKey: sourceLibraryKey }}));
			const childItemsKeys = get(getState(), ['libraries', sourceLibraryKey, 'itemsByParent', ik, 'keys'], []);
			const patch = { parentItem: newItem.key };
			if(childItemsKeys && childItemsKeys.length) {
				return await dispatch(chunkedAction(copyToLibrary, childItemsKeys, sourceLibraryKey, targetLibraryKey, [], patch));
			}
			return [];
		});

		await Promise.all(childItemsCopyPromises);

		return newItems;
	};
}

const storeRelationInSoruce = (itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey) => {
	return async dispatch => {
		const id = requestTracker.id++;

		dispatch({
			type: PRE_STORE_RELATIONS_IN_SOURCE,
			itemKeys,
			libraryKey: sourceLibraryKey,
			targetLibraryKey,
			id,
		});

		dispatch(
			queueStoreRelationInSoruce(itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey, id)
		);
	}
}

const queueStoreRelationInSoruce = (itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey, id) => {
	return {
		queue: sourceLibraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map((ik, index) => {
				const sourceItem = getState().libraries[sourceLibraryKey].items[ik];
				const newItemKey = targetItemKeys[index];
				return {
					key: sourceItem.key,
					version: sourceItem.version,
						relations: {
						...sourceItem.relations,
						'owl:sameAs': getItemCanonicalUrl({ libraryKey: targetLibraryKey, itemKey: newItemKey })
					}
				}
			});

			dispatch({
				type: REQUEST_STORE_RELATIONS_IN_SOURCE,
				itemKeys,
				libraryKey: sourceLibraryKey,
				targetLibraryKey,
				id,
			});

			try {
				const { response } = await postItemsMultiPatch(state, multiPatch);
				dispatch({
					itemKeys,
					libraryKey: sourceLibraryKey,
					response,
					targetLibraryKey,
					type: RECEIVE_STORE_RELATIONS_IN_SOURCE,
					id,
				});
			} catch(error) {
				dispatch({
					error,
					libraryKey: sourceLibraryKey,
					targetLibraryKey,
					type: ERROR_STORE_RELATIONS_IN_SOURCE,
					id,
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const removeFromCollection = (itemKeys, collectionKey) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const id = requestTracker.id++;

		dispatch({
				type: PRE_REMOVE_ITEMS_FROM_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey,
				id
			});

		dispatch(
			queueRemoveFromCollection(itemKeys, collectionKey, libraryKey, id)
		);
	};
}

const queueRemoveFromCollection = (itemKeys, collectionKey, libraryKey, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const multiPatch = itemKeys.map(key => {
				const item = state.libraries[libraryKey].items[key];
				return {
					key,
					collections: item.collections.filter(cKey => cKey !== collectionKey),
				};
			});

			dispatch({
				type: REQUEST_REMOVE_ITEMS_FROM_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey,
				id
			});

			try {
				const { response, itemKeys, items } = await postItemsMultiPatch(state, multiPatch);
				const itemKeysChanged = Object.values(response.raw.success);

				if(response.isSuccess()) {
					dispatch({
						type: RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
						libraryKey,
						itemKeys,
						itemKeysChanged,
						collectionKey,
						items,
						response,
						id,
						otherItems: state.libraries[libraryKey].items,
					});
				} else {
					dispatch({
						type: ERROR_REMOVE_ITEMS_FROM_COLLECTION,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						collectionKey,
						id
					});
				}

				return;
			} catch(error) {
				dispatch({
					type: ERROR_REMOVE_ITEMS_FROM_COLLECTION,
					error,
					itemKeys,
					libraryKey,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const removeRelatedItem = (itemKey, relatedItemKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const item = get(state, ['libraries', libraryKey, 'items', itemKey], null);
		const relatedItem = get(state, ['libraries', libraryKey, 'items', relatedItemKey], null);

		if(!item) {
			dispatch({
				type: 'ERROR_REMOVE_RELATED_ITEMS',
				error: `Item ${itemKey} is not found in local state`,
			});
			throw new Error(`Item ${itemKey} is not found in local state`);
		}

		if(!relatedItem) {
			dispatch({
				type: 'ERROR_REMOVE_RELATED_ITEMS',
				error: `Item ${relatedItemKey} is not found in local state`,
			});
			throw new Error(`Item ${relatedItemKey} is not found in local state`);
		}

		const patch1 = {
			relations: removeRelationByItemKey(
				relatedItemKey,
				item.relations,
				libraryKey
			)
		};

		const patch2 = {
			relations: removeRelationByItemKey(
				itemKey,
				relatedItem.relations,
				libraryKey
			)
		};

		await Promise.all([
			dispatch(updateItem(itemKey, patch1)),
			dispatch(updateItem(relatedItemKey, patch2)),
		]);
	};
}

const chunkedAction = (action, itemKeys, ...args) => {
	let chunkIndex = 0;
	const chunkSize = 50;

	return async dispatch => {
		while ((chunkIndex * chunkSize) < itemKeys.length) {
			const itemKeysChunk = itemKeys.slice(chunkIndex * chunkSize, (chunkIndex * chunkSize) + chunkSize);
			await dispatch(action(itemKeysChunk, ...args))
			chunkIndex += 1;
		}
	}
}

const chunkedAddToCollection = (itemKeys, ...args) => chunkedAction(addToCollection, itemKeys, ...args);

const chunkedToggleTagsOnItems = (itemKeys, ...args) => chunkedAction(toggleTagsOnItems, itemKeys, ...args);

const chunkedDeleteItems = (itemKeys, ...args) => chunkedAction(deleteItems, itemKeys, ...args);

const chunkedMoveToTrash = (itemKeys, ...args) => chunkedAction(moveToTrash, itemKeys, ...args);

const chunkedRecoverFromTrash = (itemKeys, ...args) => chunkedAction(recoverFromTrash, itemKeys, ...args);

const chunkedRemoveFromCollection = (itemKeys, ...args) => chunkedAction(removeFromCollection, itemKeys, ...args);

const chunkedTrashOrDelete = (itemKeys, ...args) => {
	return async (dispatch, getState) => {
		const { itemsSource } = getState().current;
		if(itemsSource === 'trash') {
			return await dispatch(chunkedDeleteItems(itemKeys, ...args));
		} else {
			return await dispatch(chunkedMoveToTrash(itemKeys, ...args));
		}
	}
}

const chunkedCopyToLibrary = (itemKeys, sourceLibraryKey, ...args) => {
	return async dispatch => {
		const id = getUniqueId();

		dispatch({
			count: itemKeys.length,
			id,
			kind: 'cross-library-copy-items',
			libraryKey: sourceLibraryKey,
			type: BEGIN_ONGOING,
		});

		try {
			await dispatch(chunkedAction(copyToLibrary, itemKeys, sourceLibraryKey, ...args));
		} catch(e) {
			console.error(e);
		} finally {
			dispatch({
				id,
				kind: 'cross-library-copy-items',
				libraryKey: sourceLibraryKey,
				type: COMPLETE_ONGOING,
			});
		}
	}
}

const updateItemWithMapping = (item, fieldKey, newValue) => {
	var patch = {
		[fieldKey]: newValue
	};

	return async (dispatch, getState) => {
		// when changing itemType, map fields from old type-specific to base types and then back to new item-specific types
		if(fieldKey === 'itemType') {
			//@TODO: maybe check state if this data is already fetched, then skip
			await Promise.all([
				dispatch(fetchItemTypeFields(newValue)),
				dispatch(fetchItemTypeCreatorTypes(newValue))
			]);

			const { itemTypeFields, itemTypeCreatorTypes } = getState().meta;

			const targetTypeFields = itemTypeFields[newValue];
			const targetTypeCreatorTypes = itemTypeCreatorTypes[newValue];

			const baseValues = {};
			if(item.itemType in baseMappings) {
				const namedToBaseMap = reverseMap(baseMappings[item.itemType]);
				Object.keys(item).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						if(item[fieldName].toString().length > 0) {
							baseValues[namedToBaseMap[fieldName]] = item[fieldName];
						}
					}
				});
			}

			patch = { ...patch, ...baseValues };

			if(newValue in baseMappings) {
				const namedToBaseMap = baseMappings[newValue];
				const itemWithBaseValues = { ...item, ...baseValues };
				Object.keys(itemWithBaseValues).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						patch[namedToBaseMap[fieldName]] = itemWithBaseValues[fieldName];
						patch[fieldName] = '';
					}
				});
			}

			// patch may now contain base-type keys mapped from old-item type-specific fields
			// but not present and not mapped to the target item type
			// these keys need to be removed in order to avoid triggering error 400
			const allowedFields = ['itemType', ...targetTypeFields.map(fieldDetails => fieldDetails.field)];
			Object.keys(patch).forEach(patchedKey => {
				if(!allowedFields.includes(patchedKey)) {
					delete patch[patchedKey];
				}
			});

			//if creator is invalid in target item type, pick first valid creator type
			if(item.creators && Array.isArray(item.creators)) {
				patch.creators = item.creators.map(creator => {
					if(typeof targetTypeCreatorTypes.find(c => c.creatorType === creator.creatorType) === 'undefined') {
						creator.creatorType = targetTypeCreatorTypes[0].creatorType;
					}
					return creator;
				});
			}
		}

		else if(fieldKey === 'accessDate' || fieldKey === 'date'||
			(item.itemType in baseMappings && 'date' in baseMappings[item.itemType] && fieldKey === baseMappings[item.itemType]['date'])
		) {
			patch[fieldKey] = parseDescriptiveString(patch[fieldKey]);
			if(fieldKey === 'accessDate' && patch[fieldKey].match(/^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9])$/)) {
				// If date follows ISO format but seconds are missing we silently append 00. See #464
				patch[fieldKey] += ':00';
			}
		}

		dispatch(updateItem(item.key, patch));
	}
}

const createAttachments = (filesData, { collection = null, libraryKey = null, parentItem = null } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const id = getUniqueId();

		if (libraryKey === null) {
			libraryKey = state.current.libraryKey;
		}

		dispatch({
			count: filesData.length,
			id,
			kind: 'upload',
			libraryKey,
			type: BEGIN_ONGOING,
		});

		try {
			const attachmentTemplate = await dispatch(
				fetchItemTemplate('attachment', { linkMode: 'imported_file' })
			);
			const attachmentItems = filesData.map(fd => ({
				...attachmentTemplate,
				collections: collection ? [collection] : [],
				contentType: sniffForMIMEType(fd.file) || fd.contentType,
				filename: fd.fileName,
				parentItem: parentItem || false,
				title: fd.fileName,
			}));

			const createdItems = await dispatch(
				createItems(attachmentItems, libraryKey)
			);

			const uploadPromises = createdItems.map(async (item, index) => {
				const fd = filesData[index];
				await dispatch(uploadAttachment(item.key, fd, libraryKey));
			});

			await Promise.all(uploadPromises);

			const affectedParentItemKeys = createdItems.map(i => i.parentItem).filter(Boolean);

			if(affectedParentItemKeys.length > 0) {
				dispatch(fetchItemsByKeys(affectedParentItemKeys, {}, { current: { libraryKey }}));
			}

			return createdItems;
		} finally {
			dispatch({
				id,
				kind: 'upload',
				libraryKey,
				type: COMPLETE_ONGOING,
			});
		}
	}
}

const createAttachmentsFromDropped = (droppedFiles, ...rest) => {
	return async dispatch => {
		const filesData = await getFilesData(droppedFiles);
		return await dispatch(createAttachments(filesData, ...rest));
	}
}

const createLinkedUrlAttachments = (linkedUrlItems, { collection = null, parentItem = null } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;

		if(linkedUrlItems && !Array.isArray(linkedUrlItems)) {
			linkedUrlItems = [linkedUrlItems];
		}

		const attachmentTemplate = await dispatch(
			fetchItemTemplate('attachment', { linkMode: 'linked_url' })
		);
		const attachmentItems = linkedUrlItems.map(({ url, title = '' }) => ({
			...attachmentTemplate,
			collections: collection ? [collection] : [],
			parentItem: parentItem || false,
			url, title
		}));

		const createdItems = await dispatch(
			createItems(attachmentItems, libraryKey)
		);

		return createdItems;
	}
}

const createItemOfType = (itemType, { collection = null } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
		const template = await dispatch(fetchItemTemplate(itemType));
		const newItem = {
			...template,
			collections: collection ? [collection] : [],
		};
		return await dispatch(createItem(newItem, libraryKey));
	}
}

export {
	addToCollection,
	chunkedAddToCollection,
	chunkedCopyToLibrary,
	chunkedDeleteItems,
	chunkedMoveToTrash,
	chunkedRecoverFromTrash,
	chunkedRemoveFromCollection,
	chunkedToggleTagsOnItems,
	chunkedTrashOrDelete,
	copyToLibrary,
	createAttachments,
	createAttachmentsFromDropped,
	createItem,
	createItemOfType,
	createItems,
	createLinkedUrlAttachments,
	deleteItem,
	deleteItems,
	moveToTrash,
	recoverFromTrash,
	removeFromCollection,
	removeRelatedItem,
	toggleTagsOnItems,
	updateItem,
	updateItemWithMapping,
	uploadAttachment,
};

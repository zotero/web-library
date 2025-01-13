import api from 'zotero-api-client';
import { omit, pick } from 'web-common/utils';

import { extractItems, chunkedAction, PartialWriteError } from '../common/actions';
import { fetchItemsByKeys, fetchAllChildItems, fetchItemTemplate } from '.';
import { fetchLibrarySettings, requestTracker } from '.';
import { get, getItemCanonicalUrl, getUniqueId, removeRelationByItemKey, reverseMap } from '../utils';
import { getFilesData } from '../common/event';
import { getToggledTags, TOGGLE_TOGGLE } from '../common/tags';
import { parseDescriptiveString } from '../common/format';
import { strToISO } from '../common/date';
import { sniffForMIMEType } from '../common/mime';
import { READER_CONTENT_TYPES } from '../constants/reader';

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
	ERROR_PATCH_ATTACHMENT,
	ERROR_RECOVER_ITEMS_TRASH,
	ERROR_REGISTER_FILE_ATTACHMENTS,
	ERROR_REMOVE_ITEMS_FROM_COLLECTION,
	ERROR_STORE_RELATIONS_IN_SOURCE,
	ERROR_UPDATE_ITEM,
	ERROR_UPDATE_MULTIPLE_ITEMS,
	ERROR_UPLOAD_ATTACHMENT,
	PRE_ADD_ITEMS_TO_COLLECTION,
	PRE_ADD_TAGS_TO_ITEMS,
	PRE_CREATE_ITEMS,
	PRE_DELETE_ITEMS,
	PRE_MOVE_ITEMS_TRASH,
	PRE_PATCH_ATTACHMENT,
	PRE_RECOVER_ITEMS_TRASH,
	PRE_REMOVE_ITEMS_FROM_COLLECTION,
	PRE_STORE_RELATIONS_IN_SOURCE,
	PRE_UPDATE_ITEM,
	PRE_UPDATE_MULTIPLE_ITEMS,
	PRE_UPLOAD_ATTACHMENT,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_ADD_TAGS_TO_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_PATCH_ATTACHMENT,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_REGISTER_FILE_ATTACHMENTS,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_STORE_RELATIONS_IN_SOURCE,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_UPDATE_MULTIPLE_ITEMS,
	RECEIVE_UPLOAD_ATTACHMENT,
	REQUEST_ADD_ITEMS_TO_COLLECTION,
	REQUEST_ADD_TAGS_TO_ITEMS,
	REQUEST_CREATE_ITEM,
	REQUEST_CREATE_ITEMS,
	REQUEST_DELETE_ITEM,
	REQUEST_DELETE_ITEMS,
	REQUEST_MOVE_ITEMS_TRASH,
	REQUEST_PATCH_ATTACHMENT,
	REQUEST_RECOVER_ITEMS_TRASH,
	REQUEST_REGISTER_FILE_ATTACHMENTS,
	REQUEST_REMOVE_ITEMS_FROM_COLLECTION,
	REQUEST_STORE_RELATIONS_IN_SOURCE,
	REQUEST_UPDATE_ITEM,
	REQUEST_UPDATE_MULTIPLE_ITEMS,
	REQUEST_UPLOAD_ATTACHMENT,
} from '../constants/actions';


const postItemsMultiPatch = async (state, multiPatch, libraryKey = null) => {
	libraryKey = libraryKey ?? state.current.libraryKey;
	const config = state.config;
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

const createItems = (items, libraryKey = null) => {
	return async (dispatch, getState) => {
		libraryKey = libraryKey ?? getState().current.libraryKey;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_CREATE_ITEMS,
			libraryKey,
			items,
			id
		});

		const promise = new Promise((resolve, reject) => {
			dispatch(
				queueCreateItems(items, libraryKey, id, resolve, reject)
			);
		});
		return promise;
	};
}

const queueCreateItems = (items, libraryKey, id, resolve, reject) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const config = state.config;

			dispatch({
				type: REQUEST_CREATE_ITEMS,
				libraryKey,
				items,
				id
			});

			try {
				let response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.items()
					.post(items);

				if(!response.isSuccess()) {
					throw new PartialWriteError(JSON.stringify(response.getErrors()), response);
				}

				const createdItems = extractItems(response, state);

				//@TODO: refactor
				const otherItems = state.libraries[libraryKey] ? state.libraries[libraryKey].items : {};

				dispatch({
					type: RECEIVE_CREATE_ITEMS,
					libraryKey,
					items: createdItems,
					otherItems,
					response,
					id
				});

				resolve(response.getData());
			} catch(error) {
				dispatch({
						type: ERROR_CREATE_ITEMS,
						error,
						libraryKey,
						items,
						id,
					});
				reject(error);
				throw error;
			} finally {
				next();
			}
		}
	}
}

// TODO: migrate to use per-library queue, but refactor code that depends on result of the action
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
				throw new PartialWriteError(response.getErrors()[0], response);
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

const deleteItems = (itemKeys, libraryKey = null) => {
	return async (dispatch, getState) => {
		libraryKey = libraryKey ?? getState().current.libraryKey;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_DELETE_ITEMS,
			libraryKey,
			itemKeys,
			id
		});

		const promise = new Promise((resolve, reject) => {
			dispatch(
				queueDeleteItems(itemKeys, libraryKey, id, resolve, reject)
			);
		});
		return promise;
	};
}

const queueDeleteItems = (itemKeys, libraryKey, id, resolve, reject) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const { config } = state;
			const items = itemKeys.map(ik => state.libraries[libraryKey].items[ik]);

			dispatch({
				type: REQUEST_DELETE_ITEMS,
				libraryKey,
				itemKeys,
				items,
				id
			});

			try {
				const response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.items()
					.delete(itemKeys);

				dispatch({
					type: RECEIVE_DELETE_ITEMS,
					itemKeys,
					items,
					libraryKey,
					otherItems: state.libraries[libraryKey].items,
					response,
					id
				});
				resolve(response.items);
			} catch(error) {
				dispatch({
						type: ERROR_DELETE_ITEMS,
						error,
						libraryKey,
						itemKeys,
						id
					});
				reject(error);
				throw error;
			} finally {
				next();
			}
		}
	};
}

const updateItem = (itemKey, patch, libraryKey) => {
	return async (dispatch, getState) => {
		if (libraryKey === undefined) {
			libraryKey = getState().current.libraryKey;
		}
		const id = requestTracker.id++;

		return new Promise((resolve, reject) => {
			dispatch({
				type: PRE_UPDATE_ITEM,
				itemKey,
				libraryKey,
				patch,
				id
			});

			dispatch(
				queueUpdateItem(itemKey, patch, libraryKey, { resolve, reject, id })
			);
		});
	};
}

const queueUpdateItem = (itemKey, patch, libraryKey, { resolve, reject, id }) => {
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
						.patch({
							dateModified: new Date().toISOString().slice(0, -5) + "Z",
							...patch
						});
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

				resolve(updatedItem);
			} catch(error) {
				dispatch({
					type: ERROR_UPDATE_ITEM,
					error,
					itemKey,
					libraryKey,
					patch,
					id
				});
				reject(error);
				throw error;
			} finally {
				next();
			}
		}
	};
}

const updateMultipleItems = (multiPatch, libraryKey = null) => {
	return async (dispatch, getState) => {
		libraryKey = libraryKey ?? getState().current.libraryKey;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_UPDATE_MULTIPLE_ITEMS,
			libraryKey,
			multiPatch,
			id
		});

		const promise = new Promise((resolve, reject) => {
			dispatch(
				queueUpdateMultipleItems(multiPatch, libraryKey, id, resolve, reject)
			);
		});

		return promise;
	};
}

const queueUpdateMultipleItems = (multiPatch, libraryKey, id, resolve, reject) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();

			try {
				dispatch({
					type: REQUEST_UPDATE_MULTIPLE_ITEMS,
					libraryKey,
					multiPatch,
					id
				});
				const result = await postItemsMultiPatch(state, multiPatch, libraryKey);
				dispatch({
					type: RECEIVE_UPDATE_MULTIPLE_ITEMS,
					...result,
					libraryKey,
					multiPatch,
					id
				});
				resolve(result);
			} catch (error) {
				dispatch({
					type: ERROR_UPDATE_MULTIPLE_ITEMS,
					error,
					libraryKey,
					multiPatch,
					id
				});
				reject(error);
				throw error;
			} finally {
				next();
			}
		}
	};
}

const uploadAttachment = (itemKey, fileData, libraryKey = null) => {
	return async (dispatch, getState) => {
		libraryKey = libraryKey ?? getState().current.libraryKey;
		const id = requestTracker.id++;

		return new Promise((resolve, reject) => {
			dispatch({
				type: PRE_UPLOAD_ATTACHMENT,
				itemKey,
				fileData,
				libraryKey
			});

			dispatch(
				queueUploadAttachment(itemKey, fileData, libraryKey, { resolve, reject, id })
			);
		});
	};
}

const queueUploadAttachment = (itemKey, fileData, libraryKey, { resolve, reject, id }) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const { md5, filename: fileName } = state.libraries[libraryKey]?.items[itemKey] ?? {};
			const config = state.config;
			dispatch({
				type: REQUEST_UPLOAD_ATTACHMENT,
				libraryKey,
				itemKey,
				fileData,
				id
			});

			try {
				let response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.items(itemKey)
					.attachment(fileData.fileName ?? fileName, fileData.file, null, md5)
					.post();


				dispatch({
					type: RECEIVE_UPLOAD_ATTACHMENT,
					libraryKey,
					itemKey,
					fileData,
					response,
				});
				resolve();
			} catch(error) {
				dispatch({
					type: ERROR_UPLOAD_ATTACHMENT,
					libraryKey,
					itemKey,
					fileData,
					error,
				});
				reject(error);
			} finally {
				next();
			}
		}
	}
}

const patchAttachment = (itemKey, newFileBuf, patchBuf, libraryKey = null) => {
	return async (dispatch, getState) => {
		libraryKey = libraryKey ?? getState().current.libraryKey;
		const id = requestTracker.id++;

		dispatch({
			type: PRE_PATCH_ATTACHMENT,
			itemKey,
			newFileBuf,
			patchBuf,
			libraryKey
		});

		dispatch(
			queuePatchAttachment(itemKey, newFileBuf, patchBuf, libraryKey, id)
		);
	};
}

const queuePatchAttachment = (itemKey, newFileBuf, patchBuf, libraryKey, id) => {
	return {
		queue: libraryKey,
		callback: async (next, dispatch, getState) => {
			const state = getState();
			const { md5, filename: fileName } = state.libraries[libraryKey]?.items[itemKey] ?? {};
			const config = state.config;
			dispatch({
				type: REQUEST_PATCH_ATTACHMENT,
				libraryKey,
				itemKey,
				md5,
				fileName,
				patchBuf,
				id
			});

			try {
				let response = await api(config.apiKey, config.apiConfig)
					.library(libraryKey)
					.items(itemKey)
					.attachment(fileName, newFileBuf, null, md5, patchBuf, 'xdelta')
					.patch();

				dispatch({
					type: RECEIVE_PATCH_ATTACHMENT,
					libraryKey,
					itemKey,
					response,
					md5,
					fileName,
					patchBuf,
					id
				});
			} catch (error) {
				dispatch({
					type: ERROR_PATCH_ATTACHMENT,
					libraryKey,
					itemKey,
					error,
					md5,
					fileName,
					patchBuf,
					id
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

// TODO: Merge `moveItemsToTrash` and `recoverItemsFromTrash` into `updateItemsTrash` (+ matching queue fn). See `updateCollectionsTrash` for reference.
const moveItemsToTrash = itemKeys => {
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

				if(!response.isSuccess()) {
					throw new PartialWriteError(response.getErrors(), response);
				}

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

const recoverItemsFromTrash = itemKeys => {
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

				if(!response.isSuccess()) {
					throw new PartialWriteError(response.getErrors(), response);
				}
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

				if(!response.isSuccess()) {
					throw new PartialWriteError(response.getErrors(), response);
				}
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

				if(!response.isSuccess()) {
					throw new PartialWriteError(response.getErrors(), response);
				}
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

const copyToLibrary = (itemKeys, sourceLibraryKey, targetLibraryKey, targetCollectionKeys = [], extraProperties = {}, depth = 0, aggrMultiPatch = null) => {
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
			await dispatch(fetchLibrarySettings(targetLibraryKey, 'tagColors'));
		}

		itemKeys = itemKeys.filter(ik => {
			const sourceItem = state.libraries[sourceLibraryKey].items[ik];
			if (!sourceItem) {
				return false;
			}
			if (targetLibrary.isGroupLibrary && sourceItem.itemType === 'attachment' && sourceItem.linkMode === 'linked_file') {
				return false;
			}
			return true;
		});

		const newItems = await dispatch(
			createItems(
				itemKeys.map(ik => {
					const sourceItem = state.libraries[sourceLibraryKey].items[ik];
					// add 'owl:sameAs' relation for items and notes but not attachments or annotations (based on https://github.com/zotero/zotero/blob/c5a769285b31bde5e78ff51349adc5be8d23871f/chrome/content/zotero/collectionTree.jsx#L1636-L1661)
					const newRelations = (['attachment', 'annotation'].includes(sourceItem.itemType) || shouldStoreRelationInSource) ? sourceItem.relations : {
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
			const targetItemKeys = newItems.filter(i => !['attachment', 'annotation'].includes(i.itemType)).map(i => i.key);
			if (targetItemKeys.length) {
				dispatch(storeRelationInSource(itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey));
			}
		}

		const oldItems = newItems.map(
			(_newItem, index) => state.libraries[sourceLibraryKey].items[itemKeys[index]]
		);

		const registerUploadsPromises = newItems.map(async (newItem, index) => {
			if(newItem.itemType !== 'attachment') {
				return Promise.resolve();
			}
			const oldItem = oldItems[index];

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

		const noteImagesMap = new Map();
		const newNotes = newItems.filter(ni => ni.itemType === 'note');
		for(const newNote of newNotes) {
			const imageAttachmentKeys = Array.from(
				newNote.note.matchAll(/data-attachment-key=(?:"|')([A-Z0-9]{8})(?:"|')/ig)
			).map(m => m[1]);
			noteImagesMap.set(newNote.key, imageAttachmentKeys);
		}

		if(depth === 0) {
			aggrMultiPatch = [];
		}

		const childItemsCopyPromises = itemKeys.map(async (ik, index) => {
				const newItem = newItems[index];
				const skipChildItems = newItem.itemType === 'annotation'
					|| newItem.linkMode === 'embedded_image'
					|| (newItem.itemType === 'attachment' && !Object.keys(READER_CONTENT_TYPES).includes(newItem.contentType));

				if (skipChildItems) {
					return;
				}

				await dispatch(fetchAllChildItems(ik, null, { current: { libraryKey: sourceLibraryKey }}));
				const childItemsKeys = get(getState(), ['libraries', sourceLibraryKey, 'itemsByParent', ik, 'keys'], []);
				if(childItemsKeys && childItemsKeys.length) {
					const newChildItemsChunked = await dispatch(chunkedAction(copyToLibrary, childItemsKeys, sourceLibraryKey, targetLibraryKey, [], { parentItem: newItem.key }, depth + 1, aggrMultiPatch));
					for (const { newItems: newChildItems, oldItems: oldChildItems } of newChildItemsChunked) {
						oldChildItems.forEach((oldChildItem, index) => {
							const newChildItem = newChildItems[index];
							if (noteImagesMap.get(newChildItem.parentItem)?.includes(oldChildItem.key)) {
								// Prep a patch that replaces oldChildItem.key with newChildItem.key in newParentItem.note
								const newParentItem = newItems.find(ni => ni.key === newChildItem.parentItem);
								let patch = aggrMultiPatch.find(p => p.key === newParentItem.key);
								if(!patch) {
									patch = pick(newParentItem, ['key', 'note']);
									aggrMultiPatch.push(patch);
								}
								patch.note = patch.note.replace(
									new RegExp(`data-attachment-key=(?:"|')${oldChildItem.key}(?:"|')`),
									`data-attachment-key="${newChildItem.key}"`
								);
							}
						});
					}
				}
		});

		await Promise.all(childItemsCopyPromises);

		if (depth === 0 && aggrMultiPatch.length) {
			// all note updates aggregated throughout recursive process as a single, multi-item POST update
			await dispatch(updateMultipleItems(aggrMultiPatch, targetLibraryKey));
		}

		return {
			newItems,
			oldItems
		};
	};
}

const storeRelationInSource = (itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey) => {
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
			queueStoreRelationInSource(itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey, id)
		);
	}
}

const queueStoreRelationInSource = (itemKeys, targetItemKeys, sourceLibraryKey, targetLibraryKey, id) => {
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

				if(!response.isSuccess()) {
					throw new PartialWriteError(response.getErrors(), response);
				}
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

const chunkedAddToCollection = (itemKeys, ...args) => chunkedAction(addToCollection, itemKeys, ...args);

const chunkedToggleTagsOnItems = (itemKeys, ...args) => chunkedAction(toggleTagsOnItems, itemKeys, ...args);

const chunkedDeleteItems = (itemKeys, ...args) => chunkedAction(deleteItems, itemKeys, ...args);

const chunkedMoveItemsToTrash = (itemKeys, ...args) => chunkedAction(moveItemsToTrash, itemKeys, ...args);

const chunkedRecoverItemsFromTrash = (itemKeys, ...args) => chunkedAction(recoverItemsFromTrash, itemKeys, ...args);

const chunkedRemoveFromCollection = (itemKeys, ...args) => chunkedAction(removeFromCollection, itemKeys, ...args);

const chunkedCopyToLibrary = (itemKeys, sourceLibraryKey, ...args) => {
	return async dispatch => {
		const id = getUniqueId();

		dispatch({
			id,
			data: {
				count: itemKeys.length,
			},
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
		const { itemTypeFields, itemTypeCreatorTypes, mappings } = getState().meta;
		// when changing itemType, map fields from old type-specific to base types and then back to new item-specific types
		if(fieldKey === 'itemType') {
			const targetTypeFields = itemTypeFields[newValue];
			const targetTypeCreatorTypes = itemTypeCreatorTypes[newValue];

			const baseValues = {};
			if (item.itemType in mappings) {
				const namedToBaseMap = reverseMap(mappings[item.itemType]);
				Object.keys(item).forEach(fieldName => {
					if(fieldName in namedToBaseMap) {
						if(item[fieldName].toString().length > 0) {
							baseValues[namedToBaseMap[fieldName]] = item[fieldName];
						}
					}
				});
			}

			patch = { ...patch, ...baseValues };

			if (newValue in mappings) {
				const namedToBaseMap = mappings[newValue];
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
			(item.itemType in mappings && 'date' in mappings[item.itemType] && fieldKey === mappings[item.itemType]['date'])
		) {
			// attempt to parse date into iso format using Zotero strToDate
			const isoDate = strToISO(patch[fieldKey]);
			if (isoDate) {
				patch[fieldKey] = isoDate;
			} else {
				// if parsing fails, try check for descriptive string e.g. "today"
				patch[fieldKey] = parseDescriptiveString(patch[fieldKey]);
			}

			if(fieldKey === 'accessDate' && patch[fieldKey].match(/^([0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9])$/)) {
				// If date follows ISO format but seconds are missing we silently append 00. See #464
				patch[fieldKey] += ':00';
			}
		}

		dispatch(updateItem(item.key, patch));
	}
}

const createAttachments = (filesData, { linkMode = 'imported_file', collection = null, libraryKey = null, parentItem = null } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const id = getUniqueId();

		if (libraryKey === null) {
			libraryKey = state.current.libraryKey;
		}
		const data = {
			count: filesData.length,
			collectionKey: collection,
			libraryKey
		};

		dispatch({
			id,
			data,
			kind: 'upload',
			libraryKey,
			type: BEGIN_ONGOING,
		});

		let createdItems;

		try {
			const attachmentTemplate = await dispatch(
				fetchItemTemplate('attachment', linkMode)
			);
			const attachmentItems = filesData.map(fd => ({
				...attachmentTemplate,
				collections: collection ? [collection] : [],
				contentType: sniffForMIMEType(fd.file) || fd.contentType,
				filename: fd.fileName,
				parentItem: parentItem || false,
				title: fd.fileName,
			}));

			createdItems = await dispatch(
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
				data: {
					...data,
					createdItemsKeys: createdItems?.length ? createdItems.map(i => i.key) : []
				},
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
			fetchItemTemplate('attachment', 'linked_url')
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
	chunkedMoveItemsToTrash,
	chunkedRecoverItemsFromTrash,
	chunkedRemoveFromCollection,
	chunkedToggleTagsOnItems,
	copyToLibrary,
	createAttachments,
	createAttachmentsFromDropped,
	createItem,
	createItemOfType,
	createItems,
	createLinkedUrlAttachments,
	deleteItem,
	deleteItems,
	moveItemsToTrash,
	patchAttachment,
	recoverItemsFromTrash,
	removeFromCollection,
	removeRelatedItem,
	toggleTagsOnItems,
	updateItem,
	updateItemWithMapping,
	updateMultipleItems,
	uploadAttachment,
};

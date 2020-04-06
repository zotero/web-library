'use strict';

import api from 'zotero-api-client';
import baseMappings from 'zotero-base-mappings';
import queue from './queue';
import { fetchItemTypeFields } from './meta';
import { get, getItemCanonicalUrl, getUniqueId, removeRelationByItemKey, reverseMap } from '../utils';
import { getFilesData } from '../common/event';
import { omit } from '../common/immutable';
import { extractItems } from '../common/actions';
import { fetchItemsByKeys, fetchChildItems, fetchItemTemplate, fetchItemTypeCreatorTypes } from '.';
import { COMPLETE_ONGOING, BEGIN_ONGOING } from '../constants/actions';

import {
	ERROR_STORE_RELATIONS_IN_SOURCE,
	RECEIVE_STORE_RELATIONS_IN_SOURCE,
	ERROR_ADD_ITEMS_TO_COLLECTION,
	ERROR_CREATE_ITEM,
	ERROR_CREATE_ITEMS,
	ERROR_DELETE_ITEM,
	ERROR_DELETE_ITEMS,
	ERROR_MOVE_ITEMS_TRASH,
	ERROR_RECOVER_ITEMS_TRASH,
	ERROR_REMOVE_ITEMS_FROM_COLLECTION,
	ERROR_UPDATE_ITEM,
	ERROR_UPLOAD_ATTACHMENT,
	PRE_ADD_ITEMS_TO_COLLECTION,
	PRE_MOVE_ITEMS_TRASH,
	PRE_RECOVER_ITEMS_TRASH,
	PRE_REMOVE_ITEMS_FROM_COLLECTION,
	PRE_UPDATE_ITEM,
	RECEIVE_ADD_ITEMS_TO_COLLECTION,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_UPLOAD_ATTACHMENT,
	REQUEST_ADD_ITEMS_TO_COLLECTION,
	REQUEST_CREATE_ITEM,
	REQUEST_CREATE_ITEMS,
	REQUEST_DELETE_ITEM,
	REQUEST_DELETE_ITEMS,
	REQUEST_MOVE_ITEMS_TRASH,
	REQUEST_RECOVER_ITEMS_TRASH,
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
		const { config } = getState(state);
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
		const queueId = ++queue.counter;

		dispatch({
			type: PRE_UPDATE_ITEM,
			itemKey,
			libraryKey,
			patch,
			queueId
		});

		dispatch(
			queueUpdateItem(itemKey, patch, libraryKey, queueId)
		);
	};
}

const queueUpdateItem = (itemKey, patch, libraryKey, queueId) => {
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
				queueId
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
					queueId,
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
					queueId
				});
				throw error;
			} finally {
				next();
			}
		}
	};
}

const uploadAttachment = (itemKey, fileData) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey } = state.current;
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
		const queueId = ++queue.counter;

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

const queueMoveItemsToTrash = (itemKeys, libraryKey, queueId) => {
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

				const affectedParentItemKeys = itemKeys
					.map(ik => get(state, ['libraries', libraryKey, 'items', ik, 'parentItem']))
					.filter(Boolean);

				dispatch({
					type: RECEIVE_MOVE_ITEMS_TRASH,
					libraryKey,
					response,
					queueId,
					itemKeys,
					...itemsData,
					otherItems: state.libraries[libraryKey].items,
				});

				if(affectedParentItemKeys.length > 0) {
					dispatch(fetchItemsByKeys(affectedParentItemKeys));
				}

				if(!response.isSuccess()) {
					dispatch({
						type: ERROR_MOVE_ITEMS_TRASH,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						queueId
					});
				}

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

const recoverFromTrash = itemKeys => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const queueId = ++queue.counter;

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

const queueRecoverItemsFromTrash = (itemKeys, libraryKey, queueId) => {
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
					otherItems: state.libraries[libraryKey].items,
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

const addToCollection = (itemKeys, collectionKey) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const queueId = ++queue.counter;

		await dispatch({
				type: PRE_ADD_ITEMS_TO_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey,
				queueId
			});
		await dispatch(
			queueAddToCollection(itemKeys, collectionKey, libraryKey, queueId)
		);
	};
}

const queueAddToCollection = (itemKeys, collectionKey, libraryKey, queueId) => {
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
					otherItems: state.libraries[libraryKey].items,
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

const copyToLibrary = (itemKeys, targetLibraryKey, targetCollectionKeys = [], extraProperties = {}) => {
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
		const { libraryKey: sourceLibraryKey } = state.current;
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
			const multiPatch = itemKeys.map((ik, index) => {
				const sourceItem = getState().libraries[sourceLibraryKey].items[ik];
				const newItem = newItems[index];
				return {
					key: sourceItem.key,
					version: sourceItem.version,
						relations: {
						...sourceItem.relations,
						'owl:sameAs': getItemCanonicalUrl({ libraryKey: targetLibraryKey, itemKey: newItem.key })
					}
				}
			});
			dispatch({
				itemKeys,
				libraryKey: sourceLibraryKey,
				targetLibraryKey,
				type: REQUEST_STORE_RELATIONS_IN_SOURCE,
			});
			try {
				const { response } = await postItemsMultiPatch(state, multiPatch);
				dispatch({
					itemKeys,
					libraryKey: sourceLibraryKey,
					response,
					targetLibraryKey,
					type: RECEIVE_STORE_RELATIONS_IN_SOURCE,
				});
			} catch(error) {
				dispatch({
					error,
					libraryKey: sourceLibraryKey,
					targetLibraryKey,
					type: ERROR_STORE_RELATIONS_IN_SOURCE,
				});
				throw error;
			}
		}

		const registerUploadsPromises = newItems.map(async (newItem, index) => {
			if(newItem.itemType !== 'attachment') {
				return Promise.resolve();
			}
			const oldItem = state.libraries[sourceLibraryKey].items[itemKeys[index]];

			const { mtime, md5, filename } = oldItem;
			const fileSize = get(oldItem, [Symbol.for('links'), 'enclosure', 'length'], null);

			if(!mtime || !md5 || !filename || !fileSize) {
				return Promise.resolve();
			}

			return await api(config.apiKey, config.apiConfig)
				.library(targetLibraryKey)
				.items(newItem.key)
				.registerAttachment(filename, fileSize, mtime, md5)
				.post();
		});

		await Promise.all(registerUploadsPromises);

		const childItemsCopyPromises = itemKeys.map(async (ik, index) => {
			const newItem = newItems[index];
			const canHaveChildItems = !['attachment', 'note'].includes(newItem.itemType);
			if(!canHaveChildItems) {
				return [];
			}
			const childItems = await dispatch(fetchChildItems(ik, { start: 0, limit: 100 }));
			const childItemsKeys = childItems.map(c => c.key);
			const patch = { parentItem: newItem.key };
			if(childItemsKeys && childItemsKeys.length) {
				return await dispatch(chunkedAction(copyToLibrary, childItemsKeys, targetLibraryKey, [], patch));
			}
			return [];
		});

		await Promise.all(childItemsCopyPromises);

		return newItems;
	};
}

const removeFromCollection = (itemKeys, collectionKey) => {
	return async (dispatch, getState) => {
		const { libraryKey } = getState().current;
		const queueId = ++queue.counter;

		dispatch({
				type: PRE_REMOVE_ITEMS_FROM_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey,
				queueId
			});

		dispatch(
			queueRemoveFromCollection(itemKeys, collectionKey, libraryKey, queueId)
		);
	};
}

const queueRemoveFromCollection = (itemKeys, collectionKey, libraryKey, queueId) => {
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
				queueId
			});

			try {
				const { response, itemKeys, items } = await postItemsMultiPatch(state, multiPatch);
				const itemKeysChanged = Object.values(response.raw.success);

				dispatch({
					type: RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
					libraryKey,
					itemKeys,
					itemKeysChanged,
					collectionKey,
					items,
					response,
					queueId,
					otherItems: state.libraries[libraryKey].items,
				});

				if(!response.isSuccess()) {
					dispatch({
						type: ERROR_REMOVE_ITEMS_FROM_COLLECTION,
						itemKeys: itemKeys.filter(itemKey => !itemKeys.includes(itemKey)),
						error: response.getErrors(),
						libraryKey,
						collectionKey,
						queueId
					});
				}

				return;
			} catch(error) {
				dispatch({
					type: ERROR_REMOVE_ITEMS_FROM_COLLECTION,
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

const removeRelatedItem = (itemKey, relatedItemKey) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { userId } = state.config;
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
				userId
			)
		};

		const patch2 = {
			relations: removeRelationByItemKey(
				itemKey,
				relatedItem.relations,
				userId
			)
		};

		await Promise.all([
			dispatch(updateItem(itemKey, patch1)),
			dispatch(updateItem(relatedItemKey, patch2)),
		]);
	};
}

const chunkedAction = (action, itemKeys, ...args) => {
	return async dispatch => {
		do {
			const itemKeysChunk = itemKeys.splice(0, 50);
			await dispatch(action(itemKeysChunk, ...args))
		} while (itemKeys.length > 0);
	}
}

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

const chunkedCopyToLibrary = (itemKeys, ...args) => {
	return async (dispatch, getState) => {
		const state = getState();
		const id = getUniqueId();
		const { libraryKey } = state.current;

		dispatch({
			count: itemKeys.length,
			id,
			kind: 'cross-library-copy-items',
			libraryKey,
			type: BEGIN_ONGOING,
		});

		try {
			await dispatch(chunkedAction(copyToLibrary, itemKeys, ...args));
		} catch(e) {
			console.error(e);
		} finally {
			dispatch({
				id,
				kind: 'cross-library-copy-items',
				libraryKey,
				type: COMPLETE_ONGOING,
			});
		}
	}
}

const chunkedAddToCollection = (itemKeys, ...args) => chunkedAction(addToCollection, itemKeys, ...args);

const updateItemWithMapping = (item, fieldKey, newValue) => {
	var patch = {
		[fieldKey]: newValue
	};

	return async dispatch => {
		// when changing itemType, map fields from old type-specific to base types and then back to new item-specific types
		if(fieldKey === 'itemType') {
			//@TODO: maybe check state if this data is already fetched, then skip
			const [targetTypeFields, targetTypeCreatorTypes] = await Promise.all([
				dispatch(fetchItemTypeFields(newValue)),
				dispatch(fetchItemTypeCreatorTypes(newValue))
			]);

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
		dispatch(updateItem(item.key, patch));
	}
}

const createAttachments = (filesData, { collection = null, parentItem = null } = {}) => {
	return async (dispatch, getState) => {
		const state = getState();
		const id = getUniqueId();
		const { libraryKey } = state.current;

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
				contentType: fd.contentType,
				filename: fd.fileName,
				parentItem: parentItem || false,
				title: fd.fileName,
			}));

			const createdItems = await dispatch(
				createItems(attachmentItems, libraryKey)
			);

			const uploadPromises = createdItems.map(async (item, index) => {
				const fd = filesData[index];
				await dispatch(uploadAttachment(item.key, fd));
			});

			await Promise.all(uploadPromises);

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

export {
	addToCollection,
	chunkedAddToCollection,
	chunkedCopyToLibrary,
	chunkedDeleteItems,
	chunkedMoveToTrash,
	chunkedRecoverFromTrash,
	chunkedRemoveFromCollection,
	chunkedTrashOrDelete,
	copyToLibrary,
	createAttachments,
	createAttachmentsFromDropped,
	createItem,
	createItems,
	createLinkedUrlAttachments,
	deleteItem,
	deleteItems,
	moveToTrash,
	recoverFromTrash,
	removeFromCollection,
	removeRelatedItem,
	updateItem,
	updateItemWithMapping,
	uploadAttachment,
};

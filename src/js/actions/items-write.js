'use strict';

import api from 'zotero-api-client';
import queue from './queue';
import { fetchItemTypeFields } from './meta';
import { get, removeRelationByItemKey } from '../utils';
import { omit } from '../common/immutable';
import { extractItems } from '../common/actions';

import {
    REQUEST_CREATE_ITEMS,
    RECEIVE_CREATE_ITEMS,
    ERROR_CREATE_ITEMS,
    REQUEST_CREATE_ITEM,
    RECEIVE_CREATE_ITEM,
    ERROR_CREATE_ITEM,
    REQUEST_DELETE_ITEM,
    RECEIVE_DELETE_ITEM,
    ERROR_DELETE_ITEM,
    REQUEST_DELETE_ITEMS,
    RECEIVE_DELETE_ITEMS,
    ERROR_DELETE_ITEMS,
    PRE_UPDATE_ITEM,
    REQUEST_UPDATE_ITEM,
    RECEIVE_UPDATE_ITEM,
    ERROR_UPDATE_ITEM,
    REQUEST_UPLOAD_ATTACHMENT,
    RECEIVE_UPLOAD_ATTACHMENT,
    ERROR_UPLOAD_ATTACHMENT,
    PRE_MOVE_ITEMS_TRASH,
    REQUEST_MOVE_ITEMS_TRASH,
    RECEIVE_MOVE_ITEMS_TRASH,
    ERROR_MOVE_ITEMS_TRASH,
    PRE_RECOVER_ITEMS_TRASH,
    REQUEST_RECOVER_ITEMS_TRASH,
    RECEIVE_RECOVER_ITEMS_TRASH,
    ERROR_RECOVER_ITEMS_TRASH,
    PRE_ADD_ITEMS_TO_COLLECTION,
    REQUEST_ADD_ITEMS_TO_COLLECTION,
    RECEIVE_ADD_ITEMS_TO_COLLECTION,
    ERROR_ADD_ITEMS_TO_COLLECTION,
    PRE_REMOVE_ITEMS_FROM_COLLECTION,
    REQUEST_REMOVE_ITEMS_FROM_COLLECTION,
    RECEIVE_REMOVE_ITEMS_FROM_COLLECTION,
    ERROR_REMOVE_ITEMS_FROM_COLLECTION,
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

			dispatch({
				type: RECEIVE_CREATE_ITEMS,
				libraryKey,
				items: createdItems,
				otherItems: state.libraries[libraryKey].items,
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
				[Symbol.for('meta')]: response.getMeta()[0] || {}
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
				otherItems: state.libraries[libraryKey].items,
				response
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

				dispatch({
					type: RECEIVE_MOVE_ITEMS_TRASH,
					libraryKey,
					response,
					queueId,
					itemKeys,
					...itemsData,
					otherItems: state.libraries[libraryKey].items,
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

const addToCollection = (itemKeys, collectionKey, targetLibraryKey) => {
	return async (dispatch, getState) => {
		const { libraryKey: currentLibraryKey } = getState().current;
		const queueId = ++queue.counter;

		await dispatch({
				type: PRE_ADD_ITEMS_TO_COLLECTION,
				itemKeys,
				collectionKey,
				libraryKey: targetLibraryKey,
				queueId
			});

		if(currentLibraryKey === targetLibraryKey) {
			await dispatch(
				queueAddToCollection(itemKeys, collectionKey, currentLibraryKey, queueId)
			);
		} else {
			await dispatch(
				createItems(
					itemKeys.map(ik => ({
							...omit(
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

const copyToLibrary = (itemKeys, targetLibraryKey) => {
	return async (dispatch, getState) => {
		const { libraryKey: currentLibraryKey } = getState().current;
		return dispatch(
			createItems(
				itemKeys.map(ik => ({
					...omit(
						getState().libraries[currentLibraryKey].items[ik],
							['key', 'version', 'collections', 'deleted']
						),
				})), targetLibraryKey
			)
		);
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

export {
	addToCollection,
	copyToLibrary,
	createItem,
	createItems,
	deleteItem,
	deleteItems,
	moveToTrash,
	recoverFromTrash,
	removeFromCollection,
	removeRelatedItem,
	updateItem,
	uploadAttachment,
};

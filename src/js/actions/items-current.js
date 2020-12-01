import { omit } from '../common/immutable';
import { getApiForItems } from '../common/actions';
import { exportItems, chunkedAddTagsToItems, chunkedAddToCollection, chunkedCopyToLibrary,
chunkedTrashOrDelete, chunkedDeleteItems, chunkedMoveToTrash, chunkedRecoverFromTrash,
chunkedRemoveFromCollection, createItem, createItemOfType, toggleModal } from '.';
import columnProperties from '../constants/column-properties';

import { BIBLIOGRAPHY, COLLECTION_SELECT, EXPORT, NEW_FILE, NEW_ITEM } from '../constants/modals';

const currentDuplicateItem = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKey, libraryKey } = state.current;
		const item = state.libraries[libraryKey].items[itemKey];
		const copyItem = omit(item, ['key', 'version', 'dateAdded', 'dateModified']);
		return await dispatch(createItem(copyItem, libraryKey));
	}
}

const currentRemoveItemFromCollection = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys, collectionKey } = state.current;
		return await dispatch(chunkedRemoveFromCollection(itemKeys, collectionKey));
	}
}

const currentNewItemModal = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey } = state.current;
		return await dispatch(toggleModal(NEW_ITEM, true, { collectionKey }));
	}
}

const currentNewFileModal = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey } = state.current;
		return await dispatch(toggleModal(NEW_FILE, true, { collectionKey }));
	}
}

const currentCreateItemOfType = (itemType) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { collectionKey } = state.current;
		return await dispatch(createItemOfType(itemType, { collection: collectionKey }));
	}
}

const currentAddToCollection = targetCollectionKey => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys } = state.current;
		return await dispatch(chunkedAddToCollection(itemKeys, targetCollectionKey));
	}
}

const currentCopyToLibrary = (targetLibraryKey, targetCollectionKey = null) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys, libraryKey } = state.current;
		return await dispatch(chunkedCopyToLibrary(itemKeys, libraryKey, targetLibraryKey, targetCollectionKey));
	}
}

const currentAddToCollectionModal = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys } = state.current;
		return await dispatch(toggleModal(COLLECTION_SELECT, true, { items: itemKeys }));
	}
}

const currentBibliographyModal = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys, libraryKey } = state.current;
		dispatch(toggleModal(BIBLIOGRAPHY, true, { itemKeys, libraryKey, outputMode: 'bibliography' }));
	}
}

const currentCiteModal = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys, libraryKey } = state.current;
		dispatch(toggleModal(BIBLIOGRAPHY, true, { itemKeys, libraryKey, outputMode: 'cite' }));
	}
}

const currentTrashItems = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys } = state.current;
		return await dispatch(chunkedMoveToTrash(itemKeys));
	}
}

const currentRecoverTrashItems = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys } = state.current;
		return await dispatch(chunkedRecoverFromTrash(itemKeys));
	}
}

const currentTrashOrDelete = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys } = state.current;
		return await dispatch(chunkedTrashOrDelete(itemKeys));
	}
}

const currentDeleteItems = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys } = state.current;
		return await dispatch(chunkedDeleteItems(itemKeys));
	}
}

const currentExportItems = format => {
	return async (dispatch, getState) => {
		const state = getState();
		const { libraryKey, itemKeys } = state.current;
		return await dispatch(exportItems(itemKeys, libraryKey, format));
	}
}

const currentExportItemsModal = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys, libraryKey } = state.current
		dispatch(toggleModal(EXPORT, true, { itemKeys, libraryKey }));
	}
}

const currentAddTags = (newTags) => {
	return async (dispatch, getState) => {
		const state = getState();
		const { itemKeys, libraryKey } = state.current;
		dispatch(chunkedAddTagsToItems(itemKeys, libraryKey, newTags));
	}
}

// @TODO: reduce overlap with fetchSource in items-read.js
const currentGoToSubscribeUrl = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const config = state.config;
		const websiteUrl = state.config.websiteUrl;
		const { itemsSource, collectionKey, isMyPublications, isTrash, libraryKey, search: q, tags: tag = [], qmode } = state.current;
		const { id: libraryId, isGroupLibrary, isPublic } = state.config.libraries.find(l => l.key === libraryKey);

		const { field: sortBy, sort: sortDirection } = state.preferences.columns.find(
			column => 'sort' in column) || { field: 'title', sort: 'asc' };

		const direction = sortDirection.toLowerCase();
		const sort = (sortBy in columnProperties && columnProperties[sortBy].sortKey) || 'title';
		const sortAndDirection = { sort, direction };
		var pretendedResponse;

		switch(itemsSource) {
			case 'query':
				pretendedResponse = await getApiForItems(
					{ config, libraryKey }, 'ITEMS_BY_QUERY', { collectionKey, isTrash, isMyPublications }
				).pretend('get', null, { q, tag, qmode, ...sortAndDirection, format: 'atom' });
			break;
			case 'top':
				pretendedResponse = await getApiForItems(
					{ config, libraryKey }, 'TOP_ITEMS', {}
				).pretend('get', null, { ...sortAndDirection, format: 'atom' });
				break;
			case 'trash':
				pretendedResponse = await getApiForItems(
					{ config, libraryKey }, 'TRASH_ITEMS', {}
				).pretend('get', null, { ...sortAndDirection, format: 'atom' });
				break;
			case 'publications':
				pretendedResponse = await getApiForItems(
					{ config, libraryKey }, 'PUBLICATIONS_ITEMS', {}
				).pretend('get', null, { ...sortAndDirection, format: 'atom' });
				break;
			case 'collection':
				pretendedResponse = await getApiForItems(
					{ config, libraryKey }, 'ITEMS_IN_COLLECTION', { collectionKey }
				).pretend('get', null, { ...sortAndDirection, format: 'atom' });
				break;
		}

		const redirectUrl = pretendedResponse.getData().url;

		if(isPublic) {
			window.open(redirectUrl);
			return;
		}

		const apiKeyBase = websiteUrl + '/settings/keys/new';
		const qparams = { 'name': 'Private Feed' };
		if(isGroupLibrary){
			qparams['library_access'] = 0;
			qparams['group_' + libraryId] = 'read';
			qparams['redirect'] = redirectUrl;
		}
		else {
			qparams['library_access'] = 1;
			qparams['notes_access'] = 1;
			qparams['redirect'] = redirectUrl;
		}

		const queryParamsArray = Object.entries(qparams).map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value));
		const queryString = '?' + queryParamsArray.join('&');

		const url = apiKeyBase + queryString;
		window.open(url);
	}
}

export {
	currentAddTags,
	currentAddToCollection,
	currentAddToCollectionModal,
	currentBibliographyModal,
	currentCiteModal,
	currentCopyToLibrary,
	currentCreateItemOfType,
	currentDeleteItems,
	currentDuplicateItem,
	currentExportItems,
	currentExportItemsModal,
	currentGoToSubscribeUrl,
	currentNewFileModal,
	currentNewItemModal,
	currentRecoverTrashItems,
	currentRemoveItemFromCollection,
	currentTrashItems,
	currentTrashOrDelete,
}

import { omit } from '../common/immutable';
import { exportItems, chunkedDeleteItems, chunkedMoveToTrash, chunkedRecoverFromTrash,
chunkedRemoveFromCollection, createItem, createItemOfType, toggleModal } from '.';
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
		dispatch(toggleModal(BIBLIOGRAPHY, true, { itemKeys, libraryKey }));
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

export {
	currentAddToCollectionModal,
	currentBibliographyModal,
	currentCreateItemOfType,
	currentDeleteItems,
	currentDuplicateItem,
	currentExportItems,
	currentExportItemsModal,
	currentNewFileModal,
	currentNewItemModal,
	currentRecoverTrashItems,
	currentRemoveItemFromCollection,
	currentTrashItems,
}

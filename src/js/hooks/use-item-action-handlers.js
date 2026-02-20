import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
	currentAddToCollectionModal, currentBibliographyModal, currentCiteModal,
	currentCreateItemOfType, currentDeletePermanently, currentDuplicateItem, currentExportItemsModal,
	currentMoveToTrash, currentNewItemModal, currentRecoverFromTrash, currentRemoveItemFromCollection,
	currentUndoRetrieveMetadata, navigate, toggleItemsSortingDirection, toggleModal, triggerEditingItem,
	triggerSelectMode
} from '../actions';
import { ADD_BY_IDENTIFIER, CREATE_PARENT_ITEM, METADATA_RETRIEVAL, SORT_ITEMS, CHANGE_PARENT_ITEM } from '../constants/modals';

const useItemActionHandlers = () => {
	const dispatch = useDispatch();
	const handleAddToCollectionModalOpen = useCallback(() => {
		dispatch(currentAddToCollectionModal());
	}, [dispatch]);

	const handleRemoveFromCollection = useCallback(async () => {
		await dispatch(currentRemoveItemFromCollection());
		dispatch(triggerSelectMode(false, true));
	}, [dispatch]);

	const handleTrash = useCallback(async () => {
		await dispatch(currentMoveToTrash());
		dispatch(triggerSelectMode(false, true));
	}, [dispatch]);

	const handlePermanentlyDelete = useCallback(async () => {
		await dispatch(currentDeletePermanently());
		dispatch(triggerSelectMode(false, true));
	}, [dispatch]);

	const handleUndelete = useCallback(async () => {
		await dispatch(currentRecoverFromTrash());
		dispatch(triggerSelectMode(false, true));
	}, [dispatch]);

	const handleBibliographyModalOpen = useCallback(() => {
		dispatch(currentBibliographyModal());
	}, [dispatch]);

	const handleCiteModalOpen = useCallback(() => {
		dispatch(currentCiteModal());
	}, [dispatch]);

	const handleDuplicate = useCallback(async () => {
		const newItem = await dispatch(currentDuplicateItem());
		dispatch(triggerSelectMode(false, false));
		dispatch(navigate({ items: [newItem.key] }));
	}, [dispatch]);

	const handleExportModalOpen = useCallback(() => {
		dispatch(currentExportItemsModal());
	}, [dispatch]);

	const handleNewItemCreate = useCallback(async (itemType) => {
		const item = await dispatch(currentCreateItemOfType(itemType));
		dispatch(triggerSelectMode(false, false));
		dispatch(navigate({ items: [item.key] }));
		dispatch(triggerEditingItem(item.key, true));
	}, [dispatch]);

	const handleNewStandaloneNote = useCallback(() => {
		handleNewItemCreate('note');
	}, [handleNewItemCreate]);

	const handleSortModalOpen = useCallback(() => {
		dispatch(toggleModal(SORT_ITEMS, true));
	}, [dispatch]);

	const handleSortOrderToggle = useCallback(() => {
		// currently, item actions are only supported for the main items table, hence 'columns' can be hardcoded
		dispatch(toggleItemsSortingDirection('columns'));
	}, [dispatch]);

	const handleNewItemModalOpen = useCallback(() => {
		dispatch(currentNewItemModal());
	}, [dispatch]);

	const handleAddByIdentifierModalOpen = useCallback(() => {
		dispatch(toggleModal(ADD_BY_IDENTIFIER, true));
	}, [dispatch]);

	const handleRetrieveMetadata = useCallback(() => {
		dispatch(toggleModal(METADATA_RETRIEVAL, true, { recognizeSelected: true }));
	}, [dispatch]);

	const handleCreateParentItem = useCallback(() => {
		dispatch(toggleModal(CREATE_PARENT_ITEM, true, { createParentItem: true }));
	}, [dispatch]);

	const handleUnrecognize = useCallback(() => {
		dispatch(currentUndoRetrieveMetadata());
		setTimeout(() => dispatch(navigate({ items: [] }), 0));
	}, [dispatch]);

	const handleChangeParentItemModalOpen = useCallback(() => {
		dispatch(toggleModal(CHANGE_PARENT_ITEM, true));
	}, [dispatch]);

	return { handleAddByIdentifierModalOpen, handleAddToCollectionModalOpen, handleBibliographyModalOpen,
		handleCiteModalOpen, handleCreateParentItem, handleDuplicate, handleExportModalOpen,
		handleNewItemCreate, handleNewItemModalOpen, handleNewStandaloneNote, handlePermanentlyDelete,
		handleRemoveFromCollection, handleRetrieveMetadata, handleSortModalOpen, handleSortOrderToggle,
		handleTrash, handleUndelete, handleUnrecognize, handleChangeParentItemModalOpen
	};
}

export { useItemActionHandlers }

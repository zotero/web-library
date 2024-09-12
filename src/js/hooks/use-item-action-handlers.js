import { useCallback } from 'react';
import { useDispatch} from 'react-redux';
import { currentAddToCollectionModal, currentCiteModal, currentRemoveItemFromCollection,
	currentMoveToTrash, currentDeletePermanently, currentRecoverFromTrash, triggerSelectMode,
currentBibliographyModal, currentDuplicateItem, currentExportItemsModal, currentCreateItemOfType,
navigate, triggerEditingItem, toggleModal, toggleItemsSortingDirection, currentNewItemModal,
currentNewFileModal, } from '../actions';
import { SORT_ITEMS, ADD_BY_IDENTIFIER } from '../constants/modals';

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
		dispatch(toggleItemsSortingDirection());
	}, [dispatch]);

	const handleNewItemModalOpen = useCallback(() => {
		dispatch(currentNewItemModal());
	}, [dispatch]);

	const handleNewFileModalOpen = useCallback(() => {
		dispatch(currentNewFileModal());
	}, [dispatch]);

	const handleAddByIdentifierModalOpen = useCallback(() => {
		dispatch(toggleModal(ADD_BY_IDENTIFIER, true));
	}, [dispatch]);

	return { handleAddByIdentifierModalOpen, handleAddToCollectionModalOpen, handleCiteModalOpen,
	handleNewFileModalOpen, handleNewItemCreate, handleNewItemModalOpen, handleNewStandaloneNote,
	handleRemoveFromCollection, handleTrash, handlePermanentlyDelete, handleSortModalOpen,
	handleSortOrderToggle, handleUndelete, handleBibliographyModalOpen, handleDuplicate,
	handleExportModalOpen, }
}

export { useItemActionHandlers }

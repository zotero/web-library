import { Fragment, memo, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';

import { MoreActionsItems } from '../item/actions/more-actions';
import { currentDeletePermanently, currentMoveToTrash, currentRecoverFromTrash,
	currentRemoveItemFromCollection, navigate } from '../../actions';
import { useItemActionHandlers } from '../../hooks';
import { setModalFocusRestore } from '../../common/modal-focus-restore';

const ItemOptions = () => {
	const dispatch = useDispatch();
	const toggleRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const isTrash = useSelector(state => state.current.isTrash);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const { handleAddToCollectionModalOpen, handleCiteModalOpen, handleExportModalOpen } = useItemActionHandlers();
	const isInCollection = itemsSource === 'collection' || (itemsSource === 'query' && collectionKey);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(isOpen => !isOpen);
	}, []);

	// The item leaves the current view, so item details return to the list
	const handleLeavingAction = useCallback(action => {
		dispatch(action());
		dispatch(navigate({ items: [], view: 'item-list' }));
	}, [dispatch]);

	const handleAddToCollectionClick = useCallback(() => {
		setModalFocusRestore(toggleRef.current);
		handleAddToCollectionModalOpen();
	}, [handleAddToCollectionModalOpen]);

	const handleRemoveFromCollectionClick = useCallback(() => {
		handleLeavingAction(currentRemoveItemFromCollection);
	}, [handleLeavingAction]);

	const handleTrashClick = useCallback(() => {
		handleLeavingAction(currentMoveToTrash);
	}, [handleLeavingAction]);

	const handleRestoreToLibraryClick = useCallback(() => {
		handleLeavingAction(currentRecoverFromTrash);
	}, [handleLeavingAction]);

	const handleDeletePermanentlyClick = useCallback(() => {
		handleLeavingAction(currentDeletePermanently);
	}, [handleLeavingAction]);

	const handleCiteClick = useCallback(() => {
		setModalFocusRestore(toggleRef.current);
		handleCiteModalOpen();
	}, [handleCiteModalOpen]);

	const handleExportClick = useCallback(() => {
		setModalFocusRestore(toggleRef.current);
		handleExportModalOpen();
	}, [handleExportModalOpen]);

	return (
		<Dropdown
			className="item-options"
			isOpen={ isOpen }
			maxHeight={ true }
			onToggle={ handleToggleDropdown }
			placement="bottom-end"
			strategy="fixed"
		>
			<DropdownToggle
				ref={ toggleRef }
				className="btn-link btn-icon dropdown-toggle"
				title="Item Options"
			>
				<Icon
					type="24/options"
					symbol={ isOpen ? 'options-block' : 'options' }
					width="24"
					height="24"
				/>
			</DropdownToggle>
			{ isOpen && (
				<DropdownMenu>
					{ !isReadOnly && (
						<Fragment>
							{ !isTrash && (
								<DropdownItem onClick={ handleAddToCollectionClick }>
									Add To Collection
								</DropdownItem>
							) }
							{ isInCollection && (
								<DropdownItem onClick={ handleRemoveFromCollectionClick }>
									Remove From Collection
								</DropdownItem>
							) }
							{ isTrash ? (
								<Fragment>
									<DropdownItem onClick={ handleRestoreToLibraryClick }>
										Restore to Library
									</DropdownItem>
									<DropdownItem onClick={ handleDeletePermanentlyClick }>
										Delete Permanently
									</DropdownItem>
								</Fragment>
							) : (
								<DropdownItem onClick={ handleTrashClick }>
									Move To Trash
								</DropdownItem>
							) }
							<DropdownItem divider />
						</Fragment>
					) }
					<DropdownItem onClick={ handleCiteClick }>
						Create Citation
					</DropdownItem>
					<DropdownItem onClick={ handleExportClick }>
						Export
					</DropdownItem>
					<MoreActionsItems leadingDivider toggleRef={ toggleRef } />
				</DropdownMenu>
			) }
		</Dropdown>
	);
}

export default memo(ItemOptions);

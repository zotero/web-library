import { Fragment, memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';

import { ToolGroup } from '../ui/toolbars';
import NewItemSelector from 'component/item/actions/new-item';
import ImportAction from 'component/item/actions/import';
import ExportActions from 'component/item/actions/export';
import columnProperties from '../../constants/column-properties';
import AddByIdentifier from 'component/item/actions/add-by-identifier';
import { useItemActionHandlers } from '../../hooks';
import { currentGoToSubscribeUrl, toggleSelectMode } from '../../actions';
import { MoreActionsDropdownDesktop } from 'component/item/actions/more-actions';

const ItemActionsTouch = memo(() => {
	const dispatch = useDispatch();
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const columns = useSelector(state => state.preferences.columns);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const isFileUploadAllowed = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isFileUploadAllowed);
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isEmbedded = useSelector(state => state.config.isEmbedded);
	const search = useSelector(state => state.current.search);
	const isResults = search && search.length > 0;
	const isActionsDisabled = isSearchMode && isSingleColumn && !isResults;

	const [isOpen, setIsOpen] = useState(false);

	const { handleSortModalOpen,  handleSortOrderToggle,  handleNewItemModalOpen,
	handleNewStandaloneNote,  handleNewFileModalOpen,  handleAddByIdentifierModalOpen } =
	useItemActionHandlers();

	const sortColumn = columns.find(c => c.sort) || columns.find(c => c.field === 'title');
	const sortColumnLabel = sortColumn.field in columnProperties ?
			columnProperties[sortColumn.field].name : sortColumn.field;
	const sortColumnOrder = sortColumn.sort === 'desc' ? "Descending" : "Ascending"
	const isNewItemAllowed = !isReadOnly &&
		(itemsSource === 'top' || itemsSource === 'collection') &&
		!(isSearchMode && isSingleColumn);

	const handleDropdownToggle = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleSelectModeToggle = useCallback(() => {
		dispatch(toggleSelectMode());
	}, [dispatch]);

	const handleSubscribeClick = useCallback(() => {
		dispatch(currentGoToSubscribeUrl());
	}, [dispatch]);

	return (
        <Fragment>
			<Dropdown
				isOpen={ isOpen }
				onToggle={ handleDropdownToggle }
				disabled={ isActionsDisabled }
			>
				<DropdownToggle
					disabled={ isActionsDisabled }
					className="btn-link btn-icon dropdown-toggle item-actions-touch"
				>
					<Icon
						type="24/options"
						symbol={ isOpen ? 'options-block' : 'options' }
						width="24"
						height="24"
					/>
				</DropdownToggle>
				<DropdownMenu>
					{ (isSingleColumn && !isEmbedded) && (
						<Fragment>
							<DropdownItem onClick={ handleSelectModeToggle } >
								{ isSelectMode ? 'Cancel' : 'Select Items' }
							</DropdownItem>
							<DropdownItem divider />
						</Fragment>
					) }
					<DropdownItem onClick={ handleSortModalOpen } >
						Sort By: { sortColumnLabel }
					</DropdownItem>
					<DropdownItem onClick={ handleSortOrderToggle } >
						Sort Order: { sortColumnOrder }
					</DropdownItem>
					{ isNewItemAllowed && (
						<Fragment>
							<DropdownItem divider />
							<DropdownItem onClick={ handleNewItemModalOpen } >
								New Item
							</DropdownItem>
							<DropdownItem onClick={ handleNewStandaloneNote } >
								New Standalone Note
							</DropdownItem>
							{ isFileUploadAllowed && (
								<DropdownItem onClick={ handleNewFileModalOpen } >
									Upload File
								</DropdownItem>
							)}
							<DropdownItem onClick={ handleAddByIdentifierModalOpen } >
								Add By Identifier
							</DropdownItem>
						</Fragment>
					)}
					{ !isEmbedded && (
						<Fragment>
							<DropdownItem divider />
							<DropdownItem onClick={ handleSubscribeClick }>
								Subscribe To Feed
							</DropdownItem>
						</Fragment>
					) }
				</DropdownMenu>
			</Dropdown>
			{ !isSingleColumn && (
				<Button onClick={ handleSelectModeToggle } className="btn-link select-button">
					{ isSelectMode ? 'Cancel' : 'Select' }
				</Button>
			)}
		</Fragment>
    );
});

ItemActionsTouch.displayName = 'ItemActionsTouch';

const ItemActionsDesktop = memo(props => {
	const { onFocusNext, onFocusPrev } = props;
	const itemsSource = useSelector(state => state.current.itemsSource);
	const selectedItemsCount = useSelector(state => state.current.itemKeys.length);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const isTrash = useSelector(state => state.current.isTrash);
	const selectedContainsCollection = useSelector(state => state.current.itemKeys.some(key => state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.[Symbol.for('type')] === 'collection'));
	const collectionKey = useSelector(state => state.current.collectionKey);

	const { handleCiteModalOpen, handleNewItemCreate,  handleNewStandaloneNote, handleAddToCollectionModalOpen,
	handleRemoveFromCollection,  handleTrash, handlePermanentlyDelete,  handleUndelete,
	handleBibliographyModalOpen, } = useItemActionHandlers();

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}, [onFocusNext, onFocusPrev]);

	return (
        <Fragment>
			{ !isReadOnly && (
				<Fragment>
				<ToolGroup>
					<NewItemSelector
						disabled={ !['top', 'collection'].includes(itemsSource) }
						onFocusNext={ onFocusNext }
						onFocusPrev={ onFocusPrev }
						onNewItemCreate={ handleNewItemCreate }
						tabIndex={ -2 }
					/>
					{
						(itemsSource === 'collection' || itemsSource === 'top') && (
						<AddByIdentifier
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
						/>
					)}
					{
						(itemsSource === 'collection' || itemsSource === 'top') && (
						<Button
							icon
							onClick={ handleNewStandaloneNote }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="New Standalone Note"
						>
							<Icon type="16/note" width="16" height="16" />
						</Button>
					)}
				</ToolGroup>
				<ToolGroup>
				{ !isTrash && (
					<Fragment>
						<Button
							disabled={ selectedItemsCount === 0 }
							icon
							onClick={ handleAddToCollectionModalOpen }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Add To Collection"
						>
							<Icon type="20/add-collection" width="20" height="20" />
						</Button>
						{ (itemsSource === 'collection' || (itemsSource === 'query' && collectionKey)) && (
							<Button
								disabled={ selectedItemsCount === 0 }
								icon
								onClick={ handleRemoveFromCollection }
								onKeyDown={ handleKeyDown }
								tabIndex={ -2 }
								title="Remove From Collection"
							>
								<Icon type="20/remove-from-collection" width="20" height="20" />
							</Button>
						)}
						<Button
							disabled={ selectedItemsCount === 0 }
							icon
							onClick={ handleTrash }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Move To Trash"
						>
							<Icon type={ '16/trash' } width="16" height="16" />
						</Button>
					</Fragment>
				)}
				{ isTrash && (
					<Fragment>
						<Button
							disabled={ selectedItemsCount === 0 }
							icon
							onClick={ handlePermanentlyDelete }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Delete Permanently"
						>
							<Icon type="16/empty-trash" width="16" height="16" />
						</Button>
						<Button
							disabled={ selectedItemsCount === 0 }
							icon
							onClick={ handleUndelete }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Restore to Library"
						>
							<Icon type="16/restore" width="16" height="16" />
						</Button>
					</Fragment>
				)}
				</ToolGroup>
				</Fragment>
			) }
			<ToolGroup>
				<ImportAction
					tabIndex={-2}
					onFocusNext={onFocusNext}
					onFocusPrev={onFocusPrev}
				/>
				<ExportActions
					disabled={ selectedContainsCollection || selectedItemsCount === 0 || selectedItemsCount > 100 }
					tabIndex={ -2 }
					onFocusNext={ onFocusNext }
					onFocusPrev={ onFocusPrev }
				/>
				<Button
					disabled={ selectedContainsCollection || selectedItemsCount === 0 || selectedItemsCount > 100 }
					icon
					onClick={ handleCiteModalOpen }
					onKeyDown={ handleKeyDown }
					tabIndex={ -2 }
					title="Create Citations"
				>
					<Icon type="16/cite" width="16" height="16" />
				</Button>
				<Button
					disabled={selectedContainsCollection || selectedItemsCount === 0 || selectedItemsCount > 100 }
					icon
					onClick={ handleBibliographyModalOpen }
					onKeyDown={ handleKeyDown }
					tabIndex={ -2 }
					title="Create Bibliography"
				>
					<Icon type="16/bibliography" width="16" height="16" />
				</Button>
			</ToolGroup>
			<ToolGroup>
				<MoreActionsDropdownDesktop
					onFocusNext={ onFocusNext }
					onFocusPrev={ onFocusPrev }
					tabIndex={ -2 }
				/>
			</ToolGroup>
		</Fragment>
    );
});

ItemActionsDesktop.displayName = 'ItemActionsDesktop';

const ItemsActions = ({ onFocusNext, onFocusPrev }) => {
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	return (
		isTouchOrSmall ?
			<ItemActionsTouch /> :
			<ItemActionsDesktop onFocusNext={ onFocusNext } onFocusPrev={ onFocusPrev } />
	);
}

export { ItemActionsTouch, ItemActionsDesktop };
export default memo(ItemsActions);

import React, { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { ToolGroup } from '../ui/toolbars';
import Button from '../ui/button';
import Icon from '../ui/icon';
import NewItemSelector from './actions/new-item';
import ExportActions from './actions/export';
import columnProperties from '../../constants/column-properties';
import AddByIdentifier from './actions/add-by-identifier';
import { useItemActionHandlers } from '../../hooks';
import { toggleSelectMode } from '../../actions';
import MoreActions from './actions/more-actions';

const ItemActionsTouch = memo(() => {
	const dispatch = useDispatch();
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const columns = useSelector(state => state.preferences.columns);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);

	const [isOpen, setIsOpen] = useState(false);

	const { handleSortModalOpen,  handleSortOrderToggle,  handleNewItemModalOpen,
	handleNewStandaloneNote,  handleNewFileModalOpen,  handleAddByIdentifierModalOpen } =
	useItemActionHandlers();

	const sortColumn = columns.find(c => c.sort) || columns.find(c => c.field === 'title');
	const sortColumnLabel = sortColumn.field in columnProperties ?
			columnProperties[sortColumn.field].name : sortColumn.field;
	const sortColumnOrder = sortColumn.sort === 'desc' ? "Descending" : "Ascending"
	const isNewItemAllowed = !isReadOnly && (itemsSource === 'top' || itemsSource === 'collection');

	const handleDropdownToggle = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleSelectModeToggle = useCallback(() => {
		dispatch(toggleSelectMode());
	}, [dispatch]);

	return (
		<Dropdown
			isOpen={ isOpen }
			toggle={ handleDropdownToggle }
		>
			<DropdownToggle
				color={ null }
				className="btn-link btn-icon dropdown-toggle"
			>
				<Icon
					type="24/options"
					symbol={ isOpen ? 'options-block' : 'options' }
					width="24"
					height="24"
				/>
			</DropdownToggle>
			<DropdownMenu right>
				<DropdownItem onClick={ handleSelectModeToggle } >
					{ isSelectMode ? 'Cancel' : 'Select Items' }
				</DropdownItem>
				<DropdownItem divider />
				<DropdownItem onClick={ handleSortModalOpen } >
					Sort By: { sortColumnLabel }
				</DropdownItem>
				<DropdownItem onClick={ handleSortOrderToggle } >
					Sort Order: { sortColumnOrder }
				</DropdownItem>
				{ isNewItemAllowed && (
					<React.Fragment>
						<DropdownItem divider />
						<DropdownItem onClick={ handleNewItemModalOpen } >
							New Item
						</DropdownItem>
						<DropdownItem onClick={ handleNewStandaloneNote } >
							New Standalone Note
						</DropdownItem>
						<DropdownItem onClick={ handleNewFileModalOpen } >
							Upload File
						</DropdownItem>
						<DropdownItem onClick={ handleAddByIdentifierModalOpen } >
							Add By Identifier
						</DropdownItem>
					</React.Fragment>
				)}
			</DropdownMenu>
		</Dropdown>
	);
});

ItemActionsTouch.displayName = 'ItemActionsTouch';

const ItemActionsDesktop = memo(props => {
	const { onFocusNext, onFocusPrev } = props;
	const itemsSource = useSelector(state => state.current.itemsSource);
	const selectedItemsCount = useSelector(state => state.current.itemKeys.length);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const { handleNewItemCreate,  handleNewStandaloneNote,  handleDuplicate,
	handleAddToCollectionModalOpen,  handleRemoveFromCollection,  handleTrash,
	handlePermanentlyDelete,  handleUndelete,  handleBibliographyModalOpen, } =
	useItemActionHandlers();

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
		<React.Fragment>
			{ !isReadOnly && (
				<React.Fragment>
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
					{
						(itemsSource === 'collection' || itemsSource === 'top') && (
						<Button
							disabled={ selectedItemsCount !== 1 || itemsSource === 'trash' }
							icon
							onClick={ handleDuplicate }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Duplicate Item"
						>
							<Icon type="16/duplicate" width="16" height="16" />
						</Button>
					)}
				</ToolGroup>
				<ToolGroup>
				{ itemsSource !== 'trash' && (
					<React.Fragment>
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
						{ itemsSource === 'collection' && (
							<Button
								disabled={ selectedItemsCount === 0 }
								icon
								onClick={ handleRemoveFromCollection }
								onKeyDown={ handleKeyDown }
								tabIndex={ -2 }
								title="Remove from Collection"
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
							title="Move to Trash"
						>
							<Icon type={ '16/trash' } width="16" height="16" />
						</Button>
					</React.Fragment>
				)}
				{ itemsSource === 'trash' && (
					<React.Fragment>
						<Button
							disabled={ selectedItemsCount === 0 }
							icon
							onClick={ handlePermanentlyDelete }
							onKeyDown={ handleKeyDown }
							tabIndex={ -2 }
							title="Delete Item"
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
					</React.Fragment>
				)}
				</ToolGroup>
				</React.Fragment>
			) }
			<ToolGroup>
				<ExportActions tabIndex={ -2 } onFocusNext={ onFocusNext } onFocusPrev={ onFocusPrev } />
				{/*
				<Button
					icon
					disabled={ selectedItemsCount === 0 }
					title="Create Citation"
				>
					<Icon type="16/cite" width="16" height="16" />
				</Button>
				*/}
				<Button
					disabled={ selectedItemsCount === 0 || selectedItemsCount > 100 }
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
				<MoreActions
					onFocusNext={ onFocusNext }
					onFocusPrev={ onFocusPrev }
					onNewItemCreate={ handleNewItemCreate }
					tabIndex={ -2 }
				/>
			</ToolGroup>
		</React.Fragment>
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

export default memo(ItemsActions);

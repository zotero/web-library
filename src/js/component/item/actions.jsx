'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import { ToolGroup } from '../ui/toolbars';
import Button from '../ui/button';
import Spinner from '../ui/spinner';
import Icon from '../ui/icon';
import NewItemSelector from './actions/new-item';
import ExportActions from './actions/export';
import { pick } from '../../common/immutable';
import { noop } from '../../utils';
import columnNames from '../../constants/column-names';
import { ADD_BY_IDENTIFIER, SORT_ITEMS } from '../../constants/modals';
import AddByIdentifier from './actions/add-by-identifier';


class ItemsActions extends React.PureComponent {
	state = { isOpen: false }

	handleSelectModeToggle = () => {
		const { isSelectMode, onSelectModeToggle } = this.props;
		onSelectModeToggle(!isSelectMode)
	}

	handleDropdownToggle = () => {
		this.setState(({ isOpen: wasOpen }) => ({
			isOpen: !wasOpen
		}));
	}

	handleSortOrderToggle = () => {
		const { updateItemsSorting } = this.props;
		const { preferences: { columns } } = this.props;
		const sortColumn = columns.find(c => c.sort);
		updateItemsSorting(sortColumn.field, sortColumn.sort === 'desc' ? 'asc' : 'desc');
	}

	handleSortModalOpen = () => {
		const { toggleModal } = this.props;
		toggleModal(SORT_ITEMS, true);
	}

	handleAddByIdentifierClick = () => {
		const { toggleModal } = this.props;
		toggleModal(ADD_BY_IDENTIFIER, true);
	}

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}

	get isNewItemAllowed() {
		const { isReadOnly, itemsSource } = this.props;
		return !isReadOnly && (itemsSource === 'top' || itemsSource === 'collection');
	}

	get isExportAllowed() {
		const { itemsSource } = this.props;
		return itemsSource === 'top' || itemsSource === 'collection' ||
			itemsSource === 'publications';
	}

	renderExport() {
		const { onExportModalOpen } = this.props;
		return this.isExportAllowed ? (
				<DropdownItem
					onClick={ onExportModalOpen } >
					Export
				</DropdownItem>
			) : null;
	}

	renderBibliography() {
		const { onBibliographyOpen } = this.props;
		return this.isExportAllowed ? (
				<DropdownItem
					onClick={ onBibliographyOpen } >
					Bibliography
				</DropdownItem>
			) : null;
	}

	renderMouse() {
		const { itemsSource, onAddByIdentifierModalOpen, onTrash, isDeleting,
			isReadOnly, itemKeys, onRemoveFromCollection,
			onBibliographyModalOpen, onUndelete, onDuplicate,
			onPermanentlyDelete, onNewItemCreate, } = this.props;

		return (
			<React.Fragment>
				{ !isReadOnly && (
					<React.Fragment>
					<ToolGroup>
						<NewItemSelector
							tabIndex={ -2 }
							disabled={ !['top', 'collection'].includes(itemsSource) }
							{ ...pick(this.props, ['onFocusNext', 'onFocusPrev', 'onNewItemCreate']) }
						/>
						{
							(itemsSource === 'collection' || itemsSource === 'top') && (
							<AddByIdentifier
								onClick={ onAddByIdentifierModalOpen }
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							/>
						)}
						{
							(itemsSource === 'collection' || itemsSource === 'top') && (
							<Button
								icon
								onClick={ () => onNewItemCreate('note') }
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
								title="New Standalone Note"
							>
								<Icon type="16/note" width="16" height="16" />
							</Button>
						)}
						{
							(itemsSource === 'collection' || itemsSource === 'top') && (
							<Button
								disabled={ itemKeys.length !== 1 || itemsSource === 'trash' }
								icon
								onClick={ onDuplicate }
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
								title="Duplicate Item"
							>
								<Icon type="16/duplicate" width="16" height="16" />
							</Button>
						)}
					</ToolGroup>
					<ToolGroup>
					{ itemsSource !== 'trash' && (
						<Button
							disabled={ isDeleting || itemKeys.length === 0 }
							icon
							onClick={ onTrash }
							onKeyDown={ this.handleKeyDown }
							tabIndex={ -2 }
							title="Move to Trash"
						>
						{
							isDeleting ?
							<Spinner /> :
							<Icon type={ '16/trash' } width="16" height="16" />
						}
						</Button>
					)}
					{ itemsSource === 'trash' && (
						<React.Fragment>
							<Button
								disabled={ itemKeys.length === 0 }
								icon
								onClick={ onPermanentlyDelete }
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
								title="Delete Item"
							>
								<Icon type="16/empty-trash" width="16" height="16" />
							</Button>
							<Button
								disabled={ itemKeys.length === 0 }
								icon
								onClick={ onUndelete }
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
								title="Restore to Library"
							>
								<Icon type="16/restore" width="16" height="16" />
							</Button>
						</React.Fragment>
					)}
					{ itemsSource === 'collection' && (
						<Button
							disabled={ itemKeys.length === 0 }
							icon
							onClick={ onRemoveFromCollection }
							onKeyDown={ this.handleKeyDown }
							tabIndex={ -2 }
							title="Remove from Collection"
						>
							<Icon type="20/remove-from-collection" width="20" height="20" />
						</Button>
					)}
					</ToolGroup>
					</React.Fragment>
				) }
				<ToolGroup>
					<ExportActions
						tabIndex={ -2 }
						{ ...pick(this.props, ['onFocusNext', 'onFocusPrev',
						'onExport', 'itemKeys']) } />
					{/*
					<Button
						icon
						disabled={ itemKeys.length === 0 }
						title="Create Citation"
					>
						<Icon type="16/cite" width="16" height="16" />
					</Button>
					*/}
					<Button
						disabled={ itemKeys.length === 0 }
						icon
						onClick={ onBibliographyModalOpen }
						onKeyDown={ this.handleKeyDown }
						tabIndex={ -2 }
						title="Create Bibliography"
					>
						<Icon type="16/bibliography" width="16" height="16" />
					</Button>
				</ToolGroup>
			</React.Fragment>
		);
	}

	renderTouch() {
		const { isSelectMode, preferences: { columns }, onNewItemModalOpen, onNewFileModalOpen, onNewItemCreate } = this.props;
		const { isOpen } = this.state;
		const { isNewItemAllowed, isExportAllowed } = this;
		const sortColumn = columns.find(c => c.sort) || columns.find(c => c.field === 'title');
		const sortColumnLabel = sortColumn.field in columnNames ?
			columnNames[sortColumn.field] : sortColumn.field;
		const sortColumnOrder = sortColumn.sort === 'DESC' ? "Descending" : "Ascending"

		return (
			<Dropdown
				isOpen={ isOpen }
				toggle={ this.handleDropdownToggle }
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
					<DropdownItem onClick={ this.handleSelectModeToggle } >
						{ isSelectMode ? 'Cancel' : 'Select Items' }
					</DropdownItem>
					<DropdownItem divider />
					<DropdownItem onClick={ this.handleSortModalOpen } >
						Sort By: { sortColumnLabel }
					</DropdownItem>
					<DropdownItem onClick={ this.handleSortOrderToggle } >
						Sort Order: { sortColumnOrder }
					</DropdownItem>
					{ isNewItemAllowed && (
						<React.Fragment>
							<DropdownItem divider />
							<DropdownItem onClick={ onNewItemModalOpen } >
								New Item
							</DropdownItem>
							<DropdownItem onClick={ () => onNewItemCreate('note') } >
								New Standalone Note
							</DropdownItem>
							<DropdownItem onClick={ onNewFileModalOpen } >
								Upload File
							</DropdownItem>
							<DropdownItem onClick={ this.handleAddByIdentifierClick } >
								Add By Identifier
							</DropdownItem>
						</React.Fragment>
					)}
				</DropdownMenu>
			</Dropdown>
		);
	}

	render() {
		const { device } = this.props;
		return device.isTouchOrSmall ? this.renderTouch() : this.renderMouse();
	}

	static propTypes = {
		device: PropTypes.object,
		isDeleting: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		isSelectMode: PropTypes.bool,
		itemKeys: PropTypes.array,
		itemsSource: PropTypes.string,
		onAddByIdentifierModalOpen: PropTypes.func,
		onBibliographyModalOpen: PropTypes.func,
		onBibliographyOpen: PropTypes.func,
		onDuplicate: PropTypes.func,
		onExportModalOpen: PropTypes.func,
		onFocusNext: PropTypes.func,
		onFocusPrev: PropTypes.func,
		onNewFileModalOpen: PropTypes.func,
		onNewItemModalOpen: PropTypes.func,
		onPermanentlyDelete: PropTypes.func,
		onRemoveFromCollection: PropTypes.func,
		onSelectModeToggle: PropTypes.func,
		onTrash: PropTypes.func,
		onUndelete: PropTypes.func,
		preferences: PropTypes.object,
		toggleModal: PropTypes.func,
		updateItemsSorting: PropTypes.func,
	}

	static defaultProps = {
		onFocusPrev: noop,
		onFocusPrev: noop,
	}
}

export default ItemsActions;

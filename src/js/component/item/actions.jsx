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
import columnNames from '../../constants/column-names';
import { SORT_ITEMS } from '../../constants/modals';


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
		const { onSort } = this.props;
		const { preferences: { columns } } = this.props;
		const sortColumn = columns.find(c => c.sort);
		onSort({
			sortBy: sortColumn.field,
			sortDirection: sortColumn.sort === 'DESC' ? 'ASC' : 'DESC'
		});
	}

	handleSortModalOpen = () => {
		const { toggleModal } = this.props;
		toggleModal(SORT_ITEMS, true);
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

	renderNewItem() {
		const { onNewItemModalOpen } = this.props;
		return this.isNewItemAllowed ? (
				<DropdownItem onClick={ onNewItemModalOpen } >
					New Item
				</DropdownItem>
			) : null;
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
		const { itemsSource, onTrash, isDeleting, isReadOnly, itemKeys,
			onRemoveFromCollection, onBibliographyModalOpen, onUndelete,
			onDuplicate, onPermanentlyDelete, } = this.props;

		return (
			<React.Fragment>
				{ !isReadOnly && (
					<React.Fragment>
					<ToolGroup>
						<NewItemSelector
							disabled={ !['top', 'collection'].includes(itemsSource) }
							{ ...pick(this.props, ['itemTypes', 'onNewItemCreate']) }
						/>
						{
							(itemsSource === 'collection' || itemsSource === 'top') && (
							<Button
								icon
								onClick={ onDuplicate }
								disabled={ itemKeys.length !== 1 || itemsSource === 'trash' }
								title="Duplicate Item"
							>
								<Icon type="16/duplicate" width="16" height="16" />
							</Button>
						)}
					</ToolGroup>
					<ToolGroup>
					{ itemsSource !== 'trash' && (
						<Button
							icon
							onClick={ onTrash }
							disabled={ isDeleting || itemKeys.length === 0 }
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
								icon
								onClick={ onPermanentlyDelete }
								disabled={ itemKeys.length === 0 }
								title="Delete Item"
							>
								<Icon type="16/empty-trash" width="16" height="16" />
							</Button>
							<Button
								icon
								onClick={ onUndelete }
								disabled={ itemKeys.length === 0 }
								title="Restore to Library"
							>
								<Icon type="16/restore" width="16" height="16" />
							</Button>
						</React.Fragment>
					)}
					{ itemsSource === 'collection' && (
						<Button
							icon
							onClick={ onRemoveFromCollection }
							disabled={ itemKeys.length === 0 }
							title="Remove from Collection"
						>
							<Icon type="20/remove-from-collection" width="20" height="20" />
						</Button>
					)}
					</ToolGroup>
					</React.Fragment>
				) }
				<ToolGroup>
					<ExportActions { ...pick(this.props, ['onExport', 'itemKeys']) } />
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
						icon
						onClick={ onBibliographyModalOpen }
						disabled={ itemKeys.length === 0 }
						title="Create Bibliography"
					>
						<Icon type="16/bibliography" width="16" height="16" />
					</Button>
				</ToolGroup>
			</React.Fragment>
		);
	}

	renderTouch() {
		const { isSelectMode, preferences: { columns } } = this.props;
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
				className="dropdown-wrapper"
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
							{ this.renderNewItem() }
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
		onBibliographyModalOpen: PropTypes.func,
		onBibliographyOpen: PropTypes.func,
		onDuplicate: PropTypes.func,
		onExportModalOpen: PropTypes.func,
		onNewItemModalOpen: PropTypes.func,
		onPermanentlyDelete: PropTypes.func,
		onRemoveFromCollection: PropTypes.func,
		onSelectModeToggle: PropTypes.func,
		onSort: PropTypes.func,
		onTrash: PropTypes.func,
		onUndelete: PropTypes.func,
		preferences: PropTypes.object,
	}

	static defaultProps = {

	}
}

export default ItemsActions;

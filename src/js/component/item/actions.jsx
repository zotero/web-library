'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { UncontrolledDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem
} = require('reactstrap/lib');
const { ToolGroup } = require('../ui/toolbars');
const Button = require('../ui/button');
const Spinner = require('../ui/spinner');
const Icon = require('../ui/icon');
const NewItemSelector = require('./actions/new-item');
const ExportActions = require('./actions/export');
const { pick } = require('../../common/immutable');
const { isTriggerEvent } = require('../../common/event');
const { BIBLIOGRAPHY, COLLECTION_SELECT, EXPORT,
	NEW_ITEM } = require('../../constants/modals');

class ItemsActions extends React.PureComponent {
	handleSelectModeToggle(ev) {
		const { isSelectMode, onSelectModeToggle } = this.props;
		if(isTriggerEvent(ev)) {
			onSelectModeToggle(!isSelectMode)
		}
	}

	handleAddToCollectionModalOpen() {
		const { itemKeys, toggleModal } = this.props;
		toggleModal(COLLECTION_SELECT, true, { items: itemKeys });
	}

	handleBibliographyOpen() {
		const { toggleModal } = this.props;
		toggleModal(BIBLIOGRAPHY, true);
	}

	handleExportModalOpen() {
		const { toggleModal } = this.props;
		toggleModal(EXPORT, true);
	}

	handleNewItemModalOpen() {
		const { toggleModal, collectionKey } = this.props;
		toggleModal(NEW_ITEM, true, { collectionKey });
	}

	renderDelete() {
		const { itemKeys, itemsSource, onDelete } = this.props;
		return itemKeys.length > 0 && itemsSource !== 'trash' ? (
			<DropdownItem
				onClick={ onDelete }
				onKeyDown={ ev => isTriggerEvent(ev) && onDelete(ev) }
			>
				Move { itemKeys.length > 1 ? 'Items' : 'Item' } to Trash
			</DropdownItem>
		) : null;
	}

	renderPermanentlyDelete() {
		const { itemKeys, itemsSource, onPermanentlyDelete } = this.props;
		return itemKeys.length > 0 && itemsSource === 'trash' ? (
				<DropdownItem
					onClick={ onPermanentlyDelete }
					onKeyDown={ ev => isTriggerEvent(ev) && onPermanentlyDelete(ev) }
				>
					Delete { itemKeys.length > 1 ? 'Items' : 'Item' }
				</DropdownItem>
			) : null;
	}

	renderRestoretoLibrary() {
		const { itemKeys, itemsSource, onUndelete } = this.props;
		return itemKeys.length > 0 && itemsSource === 'trash' ? (
				<DropdownItem
					onClick={ onUndelete }
					onKeyDown={ ev => isTriggerEvent(ev) && onUndelete(ev) }
				>
					Restore to Library
				</DropdownItem>
			) : null;
	}

	renderAddToCollection() {
		const { itemKeys, itemsSource } = this.props;
		return itemKeys.length > 0 && itemsSource !== 'trash' ? (
				<DropdownItem
					onClick={ () => this.handleAddToCollectionModalOpen() }
					onKeyDown={ ev => isTriggerEvent(ev) && this.handleAddToCollectionModalOpen() }
				>
					Add to Collection
				</DropdownItem>
			) : null;
	}

	renderRemoveFromCollection() {
		const { itemKeys, itemsSource, onRemove } = this.props;
		return itemKeys.length > 0 && itemsSource === 'collection' ? (
				<DropdownItem
					onClick={ onRemove }
					onKeyDown={ ev => isTriggerEvent(ev) && onRemove(ev) }
				>
					Remove from Collection
				</DropdownItem>
			) : null;
	}

	renderDuplicateItem() {
		const { itemKeys, onDuplicate, itemsSource } = this.props;
		return itemsSource !== 'trash' && itemKeys.length === 1 ? (
				<DropdownItem
					onClick={ onDuplicate }
					onKeyDown={ ev => isTriggerEvent(ev) && onDuplicate(ev) }
				>
					Duplicate Item
				</DropdownItem>
			) : null;
	}

	renderShowInLibrary() {
		const { itemKeys, onLibraryShow, itemsSource } = this.props;
		return itemsSource !== 'trash' && itemsSource !== 'top' && itemKeys.length === 1 ? (
				<DropdownItem
					onClick={ onLibraryShow }
					onKeyDown={ ev => isTriggerEvent(ev) && onLibraryShow(ev) }
				>
					Show In Library
				</DropdownItem>
			) : null;
	}

	renderNewItem() {
		const { itemsSource } = this.props;
		return (itemsSource === 'top' || itemsSource === 'collection') ? (
				<DropdownItem
					onClick={ () => this.handleNewItemModalOpen() }
					onKeyDown={ ev => isTriggerEvent(ev) && this.handleNewItemModalOpen() }
				>
					New Item
				</DropdownItem>
			) : null;
	}

	renderExport() {
		const { itemsSource } = this.props;
		return (itemsSource === 'top' || itemsSource === 'collection') ? (
				<DropdownItem
					onClick={ () => this.handleExportModalOpen() }
					onKeyDown={ ev => isTriggerEvent(ev) && this.handleExportModalOpen() }
				>
					Export
				</DropdownItem>
			) : null;
	}

	renderBibliography() {
		const { itemsSource } = this.props;
		return (itemsSource === 'top' || itemsSource === 'collection') ? (
				<DropdownItem
					onClick={ () => this.handleBibliographyOpen() }
					onKeyDown={ ev => isTriggerEvent(ev) && this.handleBibliographyOpen() }
				>
					Bibliography
				</DropdownItem>
			) : null;
	}

	get hasExtraItemOptions() {
		const { itemKeys, itemsSource } = this.props;
		return (itemKeys.length === 1 && itemsSource !== 'trash') || (
			itemKeys.length > 0 && itemsSource === 'trash'
		);
	}

	renderMouse() {
		const { itemsSource, onDelete, isDeleting, itemKeys,
			onRemove, } = this.props;

		return (
			<React.Fragment>
				<ToolGroup>
					<NewItemSelector
						disabled={ !['top', 'collection'].includes(itemsSource) }
						{ ...pick(this.props, ['itemTypes', 'onNewItemCreate']) }
					/>
					<Button
						onClick={ onDelete }
						onKeyDown={ ev => isTriggerEvent(ev) && onDelete(ev) }
						disabled={ isDeleting || itemKeys.length === 0 || itemsSource === 'trash' }
						title="Move to Trash"
					>
						{
							isDeleting ?
							<Spinner /> :
							<Icon type={ '16/trash' } width="16" height="16" />
						}
					</Button>
					<Button
						onClick={ onRemove }
						onKeyDown={ ev => isTriggerEvent(ev) && onRemove(ev) }
						disabled={ itemKeys.length === 0 || itemsSource !== 'collection' }
						title="Remove from Collection"
					>
						<Icon type="20/remove-from-collection" width="20" height="20" />
					</Button>
				</ToolGroup>
				<ToolGroup>
					<ExportActions { ...pick(this.props, ['onExport', 'itemKeys']) } />
					<Button
						onClick={ () => this.handleBibliographyOpen() }
						onKeyDown={ ev => isTriggerEvent(ev) && this.handleBibliographyOpen(ev) }
						disabled={ itemKeys.length === 0 }
						title="Create Bibliography"
					>
						<Icon type="16/bibliography" width="16" height="16" />
					</Button>
				</ToolGroup>
				<ToolGroup>
					<UncontrolledDropdown className="dropdown-wrapper">
						<DropdownToggle
							color={ null }
							className="btn-icon dropdown-toggle"
							disabled={ !this.hasExtraItemOptions }
							title="More"
						>
							<Icon type="16/options" width="16" height="16" />
						</DropdownToggle>
						<DropdownMenu>
							{ this.renderRestoretoLibrary() }
							{ this.renderPermanentlyDelete() }
							{ this.renderDuplicateItem() }
							{ this.renderShowInLibrary() }
						</DropdownMenu>
					</UncontrolledDropdown>
				</ToolGroup>
			</React.Fragment>
		);
	}

	renderTouch() {
		const { isSelectMode } = this.props;
		return (
			<UncontrolledDropdown className="dropdown-wrapper">
				<DropdownToggle
					color={ null }
					className="btn-link dropdown-toggle"
				>
					<Icon type="24/options" width="24" height="24" />
				</DropdownToggle>
				<DropdownMenu right>
					<DropdownItem
						onClick={ ev => this.handleSelectModeToggle(ev) }
						onKeyDown={ ev => this.handleSelectModeToggle(ev) }
					>
						{ isSelectMode ? 'Cancel' : 'Select Items' }
					</DropdownItem>
					<DropdownItem divider />
						{ this.renderNewItem() }
						{ this.renderRemoveFromCollection() }
						{ this.renderAddToCollection() }
						{ this.renderRestoretoLibrary() }
						{ this.renderPermanentlyDelete() }
						{ this.renderDelete() }
						{ this.renderDuplicateItem() }
						{ this.renderShowInLibrary() }
						{ this.renderExport() }
						{ this.renderBibliography() }
				</DropdownMenu>
			</UncontrolledDropdown>
		);
	}

	render() {
		const { device } = this.props;
		return device.isTouchOrSmall ? this.renderTouch() : this.renderMouse();
	}

	static propTypes = {
		device: PropTypes.object,
		isSelectMode: PropTypes.bool,
	}

	static defaultProps = {

	}
}

module.exports = ItemsActions;

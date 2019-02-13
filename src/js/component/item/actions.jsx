'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { UncontrolledDropdown, DropdownToggle, DropdownMenu,
	DropdownItem } = require('reactstrap/lib');
const { ToolGroup } = require('../ui/toolbars');
const Button = require('../ui/button');
const Spinner = require('../ui/spinner');
const Icon = require('../ui/icon');
const NewItemSelector = require('./actions/new-item');
const ExportActions = require('./actions/export');
const { pick } = require('../../common/immutable');


class ItemsActions extends React.PureComponent {
	handleSelectModeToggle = () => {
		const { isSelectMode, onSelectModeToggle } = this.props;
		onSelectModeToggle(!isSelectMode)
	}

	renderPermanentlyDelete() {
		const { itemKeys, itemsSource, onPermanentlyDelete } = this.props;
		return itemKeys.length > 0 && itemsSource === 'trash' ? (
				<DropdownItem onClick={ onPermanentlyDelete } >
					Delete { itemKeys.length > 1 ? 'Items' : 'Item' }
				</DropdownItem>
			) : null;
	}

	renderRestoretoLibrary() {
		const { itemKeys, itemsSource, onUndelete } = this.props;
		return itemKeys.length > 0 && itemsSource === 'trash' ? (
				<DropdownItem onClick={ onUndelete } >
					Restore to Library
				</DropdownItem>
			) : null;
	}

	renderRemoveFromCollection() {
		const { itemKeys, itemsSource, onRemoveFromCollection } = this.props;
		return itemKeys.length > 0 && itemsSource === 'collection' ? (
				<DropdownItem onClick={ onRemoveFromCollection } >
					Remove from Collection
				</DropdownItem>
			) : null;
	}

	renderDuplicateItem() {
		const { itemKeys, onDuplicate, itemsSource } = this.props;
		return itemsSource !== 'trash' && itemKeys.length === 1 ? (
				<DropdownItem onClick={ onDuplicate } >
					Duplicate Item
				</DropdownItem>
			) : null;
	}

	renderShowInLibrary() {
		const { itemKeys, onLibraryShow, itemsSource } = this.props;
		return itemsSource !== 'trash' && itemsSource !== 'top' && itemKeys.length === 1 ? (
				<DropdownItem onClick={ onLibraryShow } >
					Show In Library
				</DropdownItem>
			) : null;
	}

	renderNewItem() {
		const { itemsSource, onNewItemModalOpen } = this.props;
		return (itemsSource === 'top' || itemsSource === 'collection') ? (
				<DropdownItem onClick={ onNewItemModalOpen } >
					New Item
				</DropdownItem>
			) : null;
	}

	renderExport() {
		const { itemsSource, onExportModalOpen } = this.props;
		return (itemsSource === 'top' || itemsSource === 'collection') ? (
				<DropdownItem
					onClick={ onExportModalOpen } >
					Export
				</DropdownItem>
			) : null;
	}

	renderBibliography() {
		const { itemsSource, onBibliographyOpen } = this.props;
		return (itemsSource === 'top' || itemsSource === 'collection') ? (
				<DropdownItem
					onClick={ onBibliographyOpen } >
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
		const { itemsSource, onTrash, isDeleting, itemKeys,
			onRemoveFromCollection, onBibliographyModalOpen } = this.props;

		return (
			<React.Fragment>
				<ToolGroup>
					<NewItemSelector
						disabled={ !['top', 'collection'].includes(itemsSource) }
						{ ...pick(this.props, ['itemTypes', 'onNewItemCreate']) }
					/>
					<Button
						onClick={ onTrash }
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
						onClick={ onRemoveFromCollection }
						disabled={ itemKeys.length === 0 || itemsSource !== 'collection' }
						title="Remove from Collection"
					>
						<Icon type="20/remove-from-collection" width="20" height="20" />
					</Button>
				</ToolGroup>
				<ToolGroup>
					<ExportActions { ...pick(this.props, ['onExport', 'itemKeys']) } />
					<Button
						onClick={ onBibliographyModalOpen }
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
							{ this.renderRemoveFromCollection() }
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
					<DropdownItem onClick={ this.handleSelectModeToggle } >
						{ isSelectMode ? 'Cancel' : 'Select Items' }
					</DropdownItem>
					<DropdownItem divider />
						{ this.renderNewItem() }
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

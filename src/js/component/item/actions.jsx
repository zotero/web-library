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

class ItemsActions extends React.PureComponent {

	renderPermanentlyDelete() {
		const { selectedItemKeys, itemsSource, onPermanentlyDelete } = this.props;
		return selectedItemKeys.length > 0 && itemsSource === 'trash' ? (
				<DropdownItem onClick={ onPermanentlyDelete }>
					Delete { selectedItemKeys.length > 1 ? 'Items' : 'Item' }
				</DropdownItem>
			) : null;
	}

	renderRestoretoLibrary() {
		const { selectedItemKeys, itemsSource, onUndelete } = this.props;
		return selectedItemKeys.length > 0 && itemsSource === 'trash' ? (
				<DropdownItem onClick={ onUndelete }>
					Restore to Library
				</DropdownItem>
			) : null;
	}

	renderRemoveFromCollection() {
		const { selectedItemKeys, itemsSource, onRemove } = this.props;
		return selectedItemKeys.length > 0 && itemsSource === 'collection' ? (
				<DropdownItem onClick={ onRemove }>
					Remove from Collection
				</DropdownItem>
			) : null;
	}

	renderDuplicateItem() {
		const { selectedItemKeys, onDuplicate } = this.props;
		return selectedItemKeys.length === 1 ? (
				<DropdownItem onClick={ onDuplicate }>
					Duplicate Item
				</DropdownItem>
			) : null;
	}

	renderShowInLibrary() {
		const { selectedItemKeys, onLibraryShow } = this.props;
		return selectedItemKeys.length === 1 ? (
				<DropdownItem onClick={ onLibraryShow }>
					Show In Library
				</DropdownItem>
			) : null;
	}

	get hasExtraItemOptions() {
		const { selectedItemKeys, itemsSource } = this.props;
		return selectedItemKeys.length === 1 || (
			selectedItemKeys.length > 0 && itemsSource === 'trash'
		);
	}

	renderMouse() {
		const { itemsSource, onDelete, isDeleting, selectedItemKeys,
			onBibliographyOpen, onRemove, } = this.props;

		return (
			<React.Fragment>
				<ToolGroup>
					<NewItemSelector
						disabled={ !['top', 'collection'].includes(itemsSource) }
						{ ...this.props }
					/>
					<Button
						onClick={ onDelete }
						disabled={ isDeleting || selectedItemKeys.length === 0 || itemsSource === 'trash' }
					>
						{
							isDeleting ?
							<Spinner /> :
							<Icon type={ '16/trash' } width="16" height="16" />
						}
					</Button>
					<Button
						onClick={ onRemove }
						disabled={ selectedItemKeys.length === 0 || itemsSource !== 'collection' }
					>
						<Icon type="20/remove-from-collection" width="20" height="20" />
					</Button>
				</ToolGroup>
				<ToolGroup>
					<ExportActions { ...this.props } />
					<Button
						onClick={ onBibliographyOpen }
						disabled={ selectedItemKeys.length === 0 }
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
		const { isSelectMode, onSelectModeToggle, onExportModalOpen,
			onBibliographyOpen } = this.props;
		return (
			<UncontrolledDropdown className="dropdown-wrapper">
				<DropdownToggle
					color={ null }
					className="btn-icon dropdown-toggle"
				>
					<Icon type="24/options" width="24" height="24" />
				</DropdownToggle>
				<DropdownMenu>
					<DropdownItem onClick={ () => onSelectModeToggle(!isSelectMode) }>
						{ isSelectMode ? 'Cancel' : 'Select Items' }
					</DropdownItem>
					<DropdownItem divider />
						{ this.renderRemoveFromCollection() }
						{ this.renderRestoretoLibrary() }
						{ this.renderPermanentlyDelete() }
						{ this.renderDuplicateItem() }
						{ this.renderShowInLibrary() }
					<DropdownItem onClick={ onExportModalOpen }>
						Export
					</DropdownItem>
					<DropdownItem onClick={ onBibliographyOpen }>
						Bibliography
					</DropdownItem>
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

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { Dropdown, DropdownToggle, DropdownMenu,
	DropdownItem } = require('reactstrap/lib');
const { ToolGroup } = require('../ui/toolbars');
const Button = require('../ui/button');
const Spinner = require('../ui/spinner');
const Icon = require('../ui/icon');
const NewItemSelector = require('./actions/new-item');
const ExportActions = require('./actions/export');
const { pick } = require('../../common/immutable');


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

	renderMouse() {
		const { itemsSource, onTrash, isDeleting, itemKeys,
			onRemoveFromCollection, onBibliographyModalOpen, onUndelete,
			onDuplicate, onPermanentlyDelete } = this.props;

		return (
			<React.Fragment>
				<ToolGroup>
					<NewItemSelector
						disabled={ !['top', 'collection'].includes(itemsSource) }
						{ ...pick(this.props, ['itemTypes', 'onNewItemCreate']) }
					/>
					<Button
						onClick={ onDuplicate }
						disabled={ itemKeys.length !== 1 || itemsSource === 'trash' }
						title="Duplicate Item"
					>
						<Icon type="16/duplicate" width="16" height="16" />
					</Button>
				</ToolGroup>
				<ToolGroup>
				{ itemsSource !== 'trash' && (
					<Button
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
							onClick={ onPermanentlyDelete }
							disabled={ itemKeys.length === 0 }
							title="Delete Item"
						>
							<Icon type="16/empty-trash" width="16" height="16" />
						</Button>
						<Button
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
						onClick={ onRemoveFromCollection }
						disabled={ itemKeys.length === 0 }
						title="Remove from Collection"
					>
						<Icon type="20/remove-from-collection" width="20" height="20" />
					</Button>
				)}
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
			</React.Fragment>
		);
	}

	renderTouch() {
		const { isSelectMode } = this.props;
		const { isOpen } = this.state;
		return (
			<Dropdown
				isOpen={ isOpen }
				toggle={ this.handleDropdownToggle }
				className="dropdown-wrapper"
			>
				<DropdownToggle
					color={ null }
					className="btn-link dropdown-toggle"
				>
					<Icon
						type={ isOpen ? "24/options-block" : "24/options" }
						width="24"
						height="24"
					/>
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
		onTrash: PropTypes.func,
		onUndelete: PropTypes.func,
	}

	static defaultProps = {

	}
}

module.exports = ItemsActions;

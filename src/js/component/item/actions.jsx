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
					</React.Fragment>
				) }
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
		const { isNewItemAllowed, isExportAllowed } = this;

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
					{ (isNewItemAllowed || isExportAllowed) && (
						<React.Fragment>
							<DropdownItem divider />
							{ this.renderNewItem() }
							{ this.renderExport() }
							{ this.renderBibliography() }
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
		onTrash: PropTypes.func,
		onUndelete: PropTypes.func,
	}

	static defaultProps = {

	}
}

export default ItemsActions;

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Spinner from '../ui/spinner';
import Button from '../ui/button';
import Icon from '../ui/icon';
import Modal from '../ui/modal';
import Input from '../form/input';
import { getUniqueId } from '../../utils';
import { formatByline } from '../../common/format';
import { ADD_BY_IDENTIFIER } from '../../constants/modals';
import cx from 'classnames';


class AddByIdentifierModal extends React.PureComponent {
	state = {
		identifier: ''
	}

	inputId = getUniqueId();

	handleCancel = async () => {
		const { toggleModal, resetIdentifier } = this.props;
		toggleModal(ADD_BY_IDENTIFIER, false);
		resetIdentifier();
	}

	handleInputChange = identifier => {
		this.setState({ identifier });
	}

	handleInputCommit = identifier => {
		const { searchIdentifier } = this.props;
		this.setState({ identifier });
		if(identifier) {
			searchIdentifier(identifier);
		}
	}

	handleInputBlur = () => true;

	handleSearchClick = () => {
		const { searchIdentifier } = this.props;
		const { identifier } = this.state;
		if(identifier) {
			searchIdentifier(identifier);
		}
	}

	handleAddClick = async () => {
		const { createItem, collectionKey, itemsSource, libraryKey, navigate,
			resetIdentifier, reviewItem, toggleModal } = this.props;
		if(!reviewItem) { return; }
		if(itemsSource === 'collection' && collectionKey) {
			reviewItem.collections = [collectionKey];
		}
		this.setState({ isBusy: true });
		const item = await createItem(reviewItem, libraryKey);
		this.setState({ isBusy: false });
		toggleModal(ADD_BY_IDENTIFIER, false);
		resetIdentifier();
		navigate({
			library: libraryKey,
			collection: collectionKey,
			items: [item.key],
			view: 'item-list'
		});
	}

	renderModalContent() {
		const { device, isError, isSearching, reviewItem } = this.props;
		const { identifier } = this.state;
		return (
			<div className="modal-content" tabIndex={ -1 }>
				<div className="modal-header">
					{
						device.isTouchOrSmall ? (
							<React.Fragment>
								<div className="modal-header-left">
									<Button
										className="btn-link"
										onClick={ this.handleCancel }
									>
										Cancel
									</Button>
								</div>
								<div className="modal-header-center">
									<h4 className="modal-title truncate">
										Add Item
									</h4>
								</div>
								<div className="modal-header-right">
									<Button
										disabled={ !reviewItem }
										className="btn-link"
										onClick={ this.handleAddClick }
									>
										Add
									</Button>
								</div>
							</React.Fragment>
						) : (
							<React.Fragment>
								<h4 className="modal-title truncate">
									Add Item
								</h4>
								<Button
									icon
									className="close"
									onClick={ this.handleCancel }
								>
									<Icon type={ '16/close' } width="16" height="16" />
								</Button>
							</React.Fragment>
						)
					}
				</div>
				<div
					className={ cx(
						'modal-body',
						{ loading: !device.isTouchOrSmall && isSearching }
					)}
					tabIndex={ !device.isTouchOrSmall ? 0 : null }
				>
					<div className="form">
						<label htmlFor={ this.inputId }>
							Enter a URL, ISBN, DOI, PMID, or arXiv ID:
						</label>
						<Input
							autoFocus
							id={ this.inputId }
							onChange={ this.handleInputChange }
							onCommit={ this.handleInputCommit }
							onBlur={ this.handleInputBlur }
							value={ identifier }
							tabIndex={ 0 }
						/>
						<Button onClick={ this.handleSearchClick } >Search</Button>
					</div>
					<div className="preview">
						{ isSearching && <Spinner /> }
						{ isError && (
							<div className="no-results">
								An error occurred
							</div>
						)}
						{ reviewItem && (
							<React.Fragment>
								<div className="title">
									{ reviewItem.title }
								</div>
								<div className="by-line">
									{ reviewItem && formatByline(reviewItem) }
								</div>
							</React.Fragment>
						) }
					</div>
					<Button
						disabled={ !reviewItem }
						className="btn-link"
						onClick={ this.handleAddClick }
					>
						Add
					</Button>
				</div>
			</div>
		);
	}

	render() {
		const { device, isOpen } = this.props;
		const { isBusy } = this.state;
		const className = cx({
			'add-by-identifier-modal': true,
			'modal-centered': device.isTouchOrSmall,
			'modal-xl modal-scrollable': !device.isTouchOrSmall,
			'modal-touch modal-form': device.isTouchOrSmall,
			'loading': isBusy,
		});
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Add By Identifier"
				className={ className }
				onRequestClose={ this.handleCancel }
				closeTimeoutMS={ device.isTouchOrSmall ? 200 : null }
				overlayClassName={ device.isTouchOrSmall ? "modal-slide" : null }
			>
				{ isBusy ? <Spinner className="large" /> : this.renderModalContent() }
			</Modal>
		);
	}

	static propTypes = {
		collectionKey: PropTypes.string,
		createItem: PropTypes.func,
		device: PropTypes.object,
		isError: PropTypes.bool,
		isOpen: PropTypes.bool,
		isSearching: PropTypes.bool,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string,
		navigate: PropTypes.func,
		resetIdentifier:  PropTypes.func,
		reviewItem: PropTypes.object,
		searchIdentifier: PropTypes.func,
		toggleModal: PropTypes.func.isRequired,
	}
}


export default AddByIdentifierModal;

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Select from '../form/select';
import Spinner from '../ui/spinner';
import { getUniqueId } from '../../utils';

const defaultState = {
	isBusy: false,
	itemType: 'book'
};

class CollectionAddModal extends React.PureComponent {
	state = defaultState;
	inputId = getUniqueId();

	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;
		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	handleNewItemCreate = async () => {
		const { createItem, fetchItemTemplate, toggleModal, push,
			collection: { key: collection } = {} , libraryKey: library, itemsSource,
			makePath, tags, triggerEditingItem, search } = this.props;
		const { itemType } = this.state;

		this.setState({ isBusy: true });
		const template = await fetchItemTemplate(itemType);
		const newItem = {
			...template,
			collections: itemsSource === 'collection' ? [collection] : []
		};
		const item = await createItem(newItem, library);

		const trash = itemsSource === 'trash';
		const publications = itemsSource === 'publications';
		const view = 'item-list';

		toggleModal(null, false);
		push(makePath({
			library, search, tags, trash, publications, collection,
			items: [item.key], view
		}));
		triggerEditingItem(item.key, true);
		this.setState({ isBusy: false });
	}

	handleSelect(itemType, hasChanged) {
		if(hasChanged) {
			this.setState({ itemType });
		}
	}

	render() {
		const { isOpen, toggleModal, itemTypes, collection } = this.props;
		const { isBusy } = this.state;
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Create a New Item"
				className={ cx('modal-touch', 'modal-centered', {
					loading: isBusy
				}) }
				onRequestClose={ () => toggleModal(null, false) }
				closeTimeoutMS={ 200 }
				overlayClassName={ "modal-slide" }
			>
				{ isBusy ? <Spinner className="large" /> : (
					<div className="modal-content" tabIndex={ -1 }>
						<div className="modal-header">
							<div className="modal-header-left">
								<Button
									className="btn-link"
									onClick={ () => toggleModal(null, false) }
								>
									Cancel
								</Button>
							</div>
							<div className="modal-header-center">
								<h4 className="modal-title truncate">
									{
										collection ?
											`Create a New Item in ${collection.name}` :
											'Create a New Item'
									}
								</h4>
							</div>
							<div className="modal-header-right">
								<Button
									className="btn-link"
									onClick={ this.handleNewItemCreate }
								>
									Create
								</Button>
							</div>
						</div>
						<div className="modal-body">
							{ isBusy ? <Spinner /> : (
								<div className="form">
									<div className="form-group">
										<label htmlFor={ this.inputId }>
											Item Type
										</label>
										<Select
											id={ this.inputId }
											className="form-control form-control-sm"
											onChange={ () => true }
											onCommit={ (...args) => this.handleSelect(...args) }
											options={ itemTypes.map(({ itemType, localized }) => (
												{ value: itemType, label: localized }
											)) }
											value={ this.state.itemType }
											searchable={ true }
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</Modal>
		);
	}

	static propTypes = {
		collection: PropTypes.object,
		createItem: PropTypes.func.isRequired,
		fetchItemTemplate: PropTypes.func.isRequired,
		isOpen: PropTypes.bool,
		itemTypes: PropTypes.array,
		libraryKey: PropTypes.string,
		makePath: PropTypes.func.isRequired,
		push: PropTypes.func.isRequired,
		toggleModal: PropTypes.func.isRequired,
		triggerEditingItem: PropTypes.func.isRequired,
	}

	static defaultProps = {
		itemTypes: [],
	}
}

export default CollectionAddModal;

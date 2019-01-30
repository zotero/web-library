'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { isTriggerEvent } = require('../../common/event');
const { makePath } = require('../../common/navigation');
const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Select = require('../form/select');
const Spinner = require('../ui/spinner');
const defaultState = {
	isBusy: false,
	itemType: 'book'
};

class CollectionAddModal extends React.PureComponent {
	state = defaultState;

	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;
		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	async handleNewItemCreate(ev) {
		const { createItem, fetchItemTemplate, toggleModal, push,
			collection: { key: collection } , libraryKey: library, itemsSource,
			tags, search } = this.props;
		const { itemType } = this.state;

		if(isTriggerEvent(ev)) {
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
			this.setState({ isBusy: false });
			toggleModal(null, false);
			push(makePath({
				library, search, tags, trash, publications, collection,
				items: [item.key], view
			}));
		}
	}

	handleSelect(itemType, hasChanged) {
		if(hasChanged) {
			this.setState({ itemType });
		}
	}

	render() {
		const { isOpen, toggleModal, itemTypes, collection } = this.props;
		const { isBusy } = this.state;
		const inputId = 'collection-add-modal-input';
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Create a New Item"
				className="modal-touch modal-centered"
				onRequestClose={ () => toggleModal(null, false) }
				closeTimeoutMS={ 200 }
				overlayClassName={ "modal-slide" }
			>
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
								onKeyDown={ ev => this.handleNewItemCreate(ev) }
								onClick={ ev => this.handleNewItemCreate(ev) }
							>
								Create
							</Button>
						</div>
					</div>
					<div className="modal-body">
						{ isBusy ? <Spinner className="large" /> : (
							<div className="form">
								<div className="form-group">
									<label htmlFor={ inputId }>
										Item Type
									</label>
									<Select
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
			</Modal>
		);
	}

	static propTypes = {
		createItem: PropTypes.func.isRequired,
		fetchItemTemplate: PropTypes.func.isRequired,
		isOpen: PropTypes.bool,
		itemTypes: PropTypes.array,
		libraryKey: PropTypes.string,
		collection: PropTypes.object,
		push: PropTypes.func.isRequired,
		toggleModal: PropTypes.func.isRequired,
	}

	static defaultProps = {
		itemTypes: [],
	}
}

module.exports = CollectionAddModal;

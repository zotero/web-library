'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { makeChildMap } = require('../../common/collection');
const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Input = require('../form/input');
const Icon = require('../ui/icon');
const defaultState = { name: '' };

class CollectionRenameModal extends React.PureComponent {
	state = defaultState;

	componentDidUpdate({ collection: prevCollection, isOpen: wasOpen }) {
		const { collection, isOpen } = this.props;

		if(typeof(prevCollection) === 'undefined' && typeof(collection) === 'object') {
			this.setState({ name: collection.name });
		}

		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	handleCollectionUpdate = () => {
		const { collection, libraryKey, toggleModal, updateCollection } = this.props;
		const { name } = this.state;

		if(!this.isValid) { return; }

		updateCollection(
			collection.key, { name }, libraryKey
		);
		toggleModal(null, false);
	}

	handleInputBlur = () => true
	handleChange = name => this.setState({ name })

	get isValid() {
		const { collection } = this.props;
		const { name } = this.state;
		return name.length > 0 && name !== (collection && collection.name);
	}

	render() {
		const { isOpen, toggleModal, collection, collections } = this.props;
		const { name } = this.state;
		const childMap = collections.length ? makeChildMap(collections) : {};
		const hasSubCollections = collection && collection.key in childMap;

		const inputId = `collection-editor-${collection ? collection.key : 'empty'}`;
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Collection Editor"
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
								Rename Collection
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								disabled={ !this.isValid }
								onClick={ this.handleCollectionUpdate }
							>
								Rename
							</Button>
						</div>
					</div>
					<div className="modal-body">
						<div className="form">
							<div className="form-group">
								<label htmlFor={ inputId }>
									<Icon type={ hasSubCollections ? '28/folders' : '28/folder' } width="28" height="28" />
								</label>
								<Input
									autoFocus
									id={ inputId }
									onBlur={ this.handleInputBlur }
									onChange={ this.handleChange }
									onCommit={ this.handleCollectionUpdate }
									tabIndex={ 0 }
									value={ name }
								/>
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		collection: PropTypes.object,
		isOpen: PropTypes.bool,
		libraryKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
		updateCollection: PropTypes.func.isRequired,
		collections: PropTypes.array
	}
}

module.exports = CollectionRenameModal;

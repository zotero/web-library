'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { isTriggerEvent } = require('../../common/event');
const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Input = require('../form/input');
const Icon = require('../ui/icon');

class CollectionRenameModal extends React.PureComponent {
	handleCollectionUpdate(ev) {
		const { collection, libraryKey, toggleModal, updateCollection } = this.props;
		if(isTriggerEvent(ev)) {
			updateCollection(
				collection.key, { name: this.inputRef.value }, libraryKey
			);
			toggleModal(null, false);
		}
	}

	render() {
		const { isOpen, toggleModal, collection } = this.props;
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
							<h4 className="modal-title text-truncate">
								Rename Collection
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								onKeyDown={ ev => this.handleCollectionUpdate(ev) }
								onClick={ ev => this.handleCollectionUpdate(ev) }
							>
								Rename
							</Button>
						</div>
					</div>
					<div className="modal-body">
						<div className="form-group">
							<label htmlFor={ inputId }>
								<Icon type="28/folder" width="28" height="28" />
							</label>
							<Input
								id={ inputId }
								autoFocus
								ref={ ref => this.inputRef = ref }
								onCommit={ (_, __, ev) => this.handleCollectionUpdate(ev) }
								value={ collection && collection.name }
								tabIndex={ 0 }
							/>
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
		updateCollection: PropTypes.func.isRequired
	}
}

module.exports = CollectionRenameModal;

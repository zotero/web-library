'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { isTriggerEvent } = require('../common/event');
const Modal = require('./ui/modal');
const Icon = require('./ui/icon');
const Button = require('./ui/button');
const Input = require('./form/input');

class CollectionEditor extends React.PureComponent {
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
		if(!collection) { return null; }
		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Collection Editor"
				className="modal-lg collection-editor"
				onRequestClose={ () => toggleModal(null, false) }
			>
				<div className="modal-content" tabIndex={ -1 }>
					<div className="modal-header">
						<h4 className="modal-title text-truncate">
							Rename Collection
						</h4>
						<Button
							className="close"
							onClick={ () => toggleModal(null, false) }
						>
							<Icon type={ '24/remove' } width="24" height="24" />
						</Button>
					</div>
					<div className="modal-body">
						<p>Please choose a new name</p>
						<div>
							<Input
								autoFocus
								selectOnFocus
								ref={ ref => this.inputRef = ref }
								onCommit={ (_, __, ev) => this.handleCollectionUpdate(ev) }
								value={ collection.name }
							/>
							<Button
								onKeyDown={ ev => this.handleCollectionUpdate(ev) }
								onClick={ ev => this.handleCollectionUpdate(ev) }
							>
								Update
							</Button>
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

module.exports = CollectionEditor;

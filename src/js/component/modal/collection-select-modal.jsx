'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { isTriggerEvent } = require('../../common/event');
const Libraries = require('../libraries');
const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Input = require('../form/input');
const Icon = require('../ui/icon');

class CollectionSelectModal extends React.PureComponent {
	state = {
		view: 'libraries',
		libraryKey: '',
		path: []
	}

	handleCollectionSelect({ library = null,  collection = null } = {}) {
		if(this.state.view === 'libraries') {
			if(collection && library) {
				this.setState({
					view: 'collection',
					path: [...this.state.path, collection],
					libraryKey: library
				})
			} else if(library) {
				this.setState({
					view: 'library',
					libraryKey: library
				})
			}
		}
	}

	render() {
		const { device, isOpen, toggleModal, collections, libraryKey,
			userLibraryKey, groups, groupCollections } = this.props;

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Select Collection"
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
								Select a Collection
							</h4>
						</div>
						<div className="modal-header-right">
							<Button
								className="btn-link"
								onKeyDown={ ev => this.handleCollectionUpdate(ev) }
								onClick={ ev => this.handleCollectionUpdate(ev) }
							>
								Confirm
							</Button>
						</div>
					</div>
					<div className="modal-body">
						<Libraries
							view={ this.state.view }
							groups={ groups }
							groupCollections={ groupCollections }
							userLibraryKey={ userLibraryKey }
							libraryKey={ this.state.libraryKey }
							device={ device }
							collections={ collections }
							path={ this.state.path }
							onSelect={ args => this.handleCollectionSelect(args) }
						/>
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		collections: PropTypes.array,
		isOpen: PropTypes.bool,
		libraryKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
	}
}

module.exports = CollectionSelectModal;

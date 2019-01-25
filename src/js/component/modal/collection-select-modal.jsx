'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { isTriggerEvent } = require('../../common/event');
const { makeChildMap } = require('../../common/collection');
const Libraries = require('../libraries');
const Modal = require('../ui/modal');
const Button = require('../ui/button');

class CollectionSelectModal extends React.PureComponent {
	state = {
		view: 'libraries',
		libraryKey: '',
		path: [],
		picked: [],
	}

	handleCollectionUpdate(ev) {
		const { items, libraryKey, toggleModal, updateCollection } = this.props;


		if(isTriggerEvent(ev)) {
			//@TODO
			console.log("add ", items, " to collections: ", this.state.picked);
			toggleModal(null, false);
		}
	}

	handleCollectionSelect({ library = null,  collection = null, ...rest } = {}) {
		const { collections } = this.props;

		if(collection && library) {
			const childMap = collections.length ? makeChildMap(collections) : {};
			const hasChildren = collection in childMap;
			const path = [...this.state.path];
			if(hasChildren) { path.push(collection); }

			this.setState({
				view: 'collection',
				libraryKey: library,
				path
			})
		} else if(library) {
			this.setState({
				view: 'library',
				libraryKey: library
			})
		}
	}

	handlePick(pickedCollection) {
		const picked = this.state.picked.filter(({ collection: c, library: l}) =>
			!(c === pickedCollection.collection && l === pickedCollection.library)
		);

		if(picked.length === this.state.picked.length) {
			picked.push(pickedCollection);
		}

		this.setState({ picked });
	}

	render() {
		const { device, isOpen, toggleModal, collections, libraryKey,
			userLibraryKey, groups, groupCollections } = this.props;

		return (
			<Modal
				isOpen={ isOpen }
				contentLabel="Select Collection"
				className="modal-touch modal-centered collection-select-modal"
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
							picked={ this.state.picked }
							isPickerMode={ true }
							onPickerPick={ args => this.handlePick(args) }
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

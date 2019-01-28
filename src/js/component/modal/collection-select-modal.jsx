'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { isTriggerEvent } = require('../../common/event');
const { makeChildMap } = require('../../common/collection');
const Libraries = require('../libraries');
const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Spinner = require('../ui/spinner');
const TouchHeader = require('../touch-header.jsx');
const defaultState = {
	view: 'libraries',
	libraryKey: '',
	path: [],
	picked: [],
};

class CollectionSelectModal extends React.PureComponent {
	state = defaultState

	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;
		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	async handleCollectionUpdate(ev) {
		const { addToCollection, items, toggleModal } = this.props;
		const { picked } = this.state;


		if(this.state.picked.length && isTriggerEvent(ev)) {
			this.setState({ isBusy: true })
			const promises = picked.map(
				targetData => addToCollection(
					items, targetData.collection, targetData.library
				)
			);
			await Promise.all(promises);
			this.setState({ isBusy: false });
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

	handleNavigation(navigationData) {
		const { path } = this.state;
		if('collection' in navigationData) {
			const targetIndex = path.indexOf(navigationData.collection);
			this.setState({ path: path.slice(0, targetIndex + 1) });
		} else if(navigationData.view === 'library') {
			this.setState({ path: [] });
		} else if(navigationData.view === 'libraries') {
			this.setState({ path: [], view: 'libraries' });
		}
	}

	render() {
		const { device, isOpen, toggleModal, collections,
			userLibraryKey, groups, groupCollections } = this.props;
		const { libraryKey, isBusy, picked } = this.state;

		const touchHeaderPath = this.state.path.map(key => ({
				key,
				type: 'collection',
				label: collections.find(c => c.key === key).name,
				path: { library: libraryKey, collection: key },
		}));

		if(this.state.view !== 'libraries') {
			touchHeaderPath.unshift({
				key: libraryKey,
				type: 'library',
				path: { library: this.state.libraryKey, view: 'library' },
				//@TODO: when first loading, group name is not known
				label: libraryKey === userLibraryKey ?
					'My Library' :
					libraryKey //@TODO: lookup name
			});
		}

		touchHeaderPath.unshift({
			key: 'root',
			type: 'root',
			path: { view: 'libraries' },
			label: 'Libraries'
		});

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
						{
							isBusy ? <Spinner className="large" /> : (
								<React.Fragment>
								<TouchHeader
									path={ touchHeaderPath }
									onNavigation={ (...args) => this.handleNavigation(...args) }
								/>
								<Libraries
									picked={ picked }
									isPickerMode={ true }
									onPickerPick={ (...args) => this.handlePick(...args) }
									view={ this.state.view }
									groups={ groups }
									groupCollections={ groupCollections }
									userLibraryKey={ userLibraryKey }
									libraryKey={ this.state.libraryKey }
									device={ device }
									collections={ collections }
									path={ this.state.path }
									onSelect={ (...args) => this.handleCollectionSelect(...args) }
								/>
								</React.Fragment>
							)
						}
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		collections: PropTypes.array,
		device: PropTypes.object,
		groupCollections: PropTypes.object,
		groups: PropTypes.array,
		isOpen: PropTypes.bool,
		libraryKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
		userLibraryKey: PropTypes.string,
	}
}

module.exports = CollectionSelectModal;

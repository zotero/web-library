'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'deep-equal';
import Types from '../../types';
import { makeChildMap } from '../../common/collection';
import Libraries from '../libraries';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Spinner from '../ui/spinner';
import TouchHeader from '../touch-header.jsx';

const defaultState = {
	view: 'libraries',
	libraryKey: '',
	path: [],
	picked: null,
};

//@TODO: reduce code duplication with AddItemstoCollections
class MoveCollectionsModal extends React.PureComponent {
	state = defaultState

	componentDidUpdate({ isOpen: wasOpen }) {
		const { isOpen } = this.props;

		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	//@TODO: merge functions navigateLocal* below (renamed from legacy functions) into a single "navigateLocal"
	//@TODO: deduplicate with add-items-to-collections
	navigateLocalFromCollectionTree = ({ library = null,  collection = null } = {}) => {
		const { collections } = this.props;
		if(library) {
			if(collection) {
				const childMap = library in collections ? makeChildMap(collections[library]) : {};
				const hasChildren = collection in childMap;
				const path = [...this.state.path];
				if(hasChildren) { path.push(collection); }
				this.setState({
					view: 'collection',
					libraryKey: library,
					path
				})
			} else {
				this.setState({
					view: 'library',
					libraryKey: library
				})
			}
		}
	}

	navigateLocalFromTouchHeader = navigationData => {
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

	pickerPick = newPicked => {
		const { picked } = this.state;
		if(deepEqual(picked, newPicked)) {
			this.setState({ picked: null });
		} else {
			this.setState({ picked: newPicked });
		}
	}

	handleMove = async () => {
		const { collectionKey, libraryKey, toggleModal, updateCollection } = this.props;
		const { picked } = this.state;


		if(picked && 'libraryKey' in picked) {
			if(picked.libraryKey !== libraryKey) {
				//@TODO: Support for moving collections across libraries #227
				return;
			}
			this.setState({ isBusy: true });
			const patch = { parentCollection: picked.collectionKey || false };
			await updateCollection(collectionKey, patch, libraryKey);
			this.setState({ isBusy: false });
			toggleModal(null, false);
		}
	}

	render() {
		const { device, isOpen, toggleModal, collections, libraries,
			userLibraryKey, groups, librariesWithCollectionsFetching, fetchAllCollections } = this.props;
		const { libraryKey, isBusy, picked, view, path } = this.state;
		const collectionsSource = libraryKey in collections ? collections[libraryKey] : [];
		const selectedCollectionKey = view === 'collection' ? path[path.length - 1] : null;

		const touchHeaderPath = this.state.path.map(key => ({
				key,
				type: 'collection',
				label: (collectionsSource.find(c => c.key === key) || {}).name,
				path: { library: libraryKey, collection: key },
		}));

		if(this.state.view !== 'libraries') {
			const libraryConfig = libraries.find(l => l.key === libraryKey) || {};
			touchHeaderPath.unshift({
				key: libraryKey,
				type: 'library',
				path: { library: this.state.libraryKey, view: 'library' },
				label: libraryConfig.name
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
					<div className="modal-body">
						{
							isBusy ? <Spinner className="large" /> : (
								<React.Fragment>
								<TouchHeader
									className="darker"
									device={ device }
									path={ touchHeaderPath }
									navigate={ this.navigateLocalFromTouchHeader }
								/>
								<Libraries
									collections={ collections }
									device={ device }
									fetchAllCollections={ fetchAllCollections }
									groups={ groups }
									isPickerMode={ true }
									libraries={ libraries }
									librariesWithCollectionsFetching={ librariesWithCollectionsFetching }
									navigate={ this.navigateLocalFromCollectionTree }
									picked={ picked === null ? [] : [ picked ] }
									pickerIncludeLibraries={ true }
									pickerPick={ this.pickerPick }
									selectedCollectionKey={ selectedCollectionKey }
									selectedLibraryKey={ this.state.libraryKey }
									userLibraryKey={ userLibraryKey }
									view={ this.state.view }
								/>
								</React.Fragment>
							)
						}
					</div>
					<div className="modal-footer">
						<div className="modal-footer-left">
							<Button
								className="btn-link"
								onClick={ () => toggleModal(null, false) }
							>
								Cancel
							</Button>
						</div>
						<div className="modal-footer-center">
							<h4 className="modal-title truncate">
								{
									picked === null ? 'Select a Collection' : 'Confirm Move?'
								}
							</h4>
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={ !picked }
								className="btn-link"
								onClick={ this.handleMove }
							>
								Move
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		collectionCountByLibrary: PropTypes.object,
		collectionKey: PropTypes.string,
		collections: PropTypes.objectOf(PropTypes.arrayOf(Types.collection)),
		device: PropTypes.object,
		fetchAllCollections: PropTypes.func.isRequired,
		groups: PropTypes.array,
		isOpen: PropTypes.bool,
		libraries: PropTypes.array,
		librariesWithCollectionsFetching: PropTypes.array,
		libraryKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
		updateCollection: PropTypes.func.isRequired,
		userLibraryKey: PropTypes.string,
	}
}

export default MoveCollectionsModal;

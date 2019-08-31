'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Types from '../../types';
import { makeChildMap } from '../../common/collection';
import Libraries from '../libraries';
import Modal from '../ui/modal';
import Button from '../ui/button';
import Spinner from '../ui/spinner';
import TouchHeader from '../touch-header.jsx';
import { pluralize } from '../../common/format';
import { sequentialChunkedAcion } from '../../common/actions';
const defaultState = {
	view: 'libraries',
	libraryKey: '',
	path: [],
	picked: [],
};
const PAGE_SIZE = 100;

class AddItemsToCollectionsModal extends React.PureComponent {
	state = defaultState

	componentDidUpdate({ isOpen: wasOpen }, { libraryKey: prevLibraryKey }) {
		const { collections, isOpen, fetchCollections,
			librariesWithCollectionsFetching, collectionCountByLibrary } = this.props;
		const { libraryKey } = this.state;

		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}
	}

	handleAddItems = async () => {
		const { addToCollection, items, toggleModal, onSelectModeToggle } = this.props;
		const { picked } = this.state;

		if(this.state.picked.length) {
			this.setState({ isBusy: true })
			const promises = picked.map(
				targetData => sequentialChunkedAcion(
					addToCollection, items, [targetData.collectionKey, targetData.libraryKey]
				)
			);
			await Promise.all(promises);
			this.setState({ isBusy: false });
			toggleModal(null, false);
			onSelectModeToggle(false);
		}
	}

	handleCollectionSelect = ({ library = null,  collection = null } = {}) => {
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

	handlePick(pickedCollection) {
		const picked = this.state.picked.filter(({ collectionKey: c, libraryKey: l}) =>
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
		const { device, isOpen, toggleModal, collections, libraries,
			userLibraryKey, groups, librariesWithCollectionsFetching, fetchAllCollections } = this.props;
		const { libraryKey, isBusy, picked } = this.state;
		const collectionsSource = collections[libraryKey];

		const touchHeaderPath = this.state.path.map(key => ({
				key,
				type: 'collection',
				label: collectionsSource.find(c => c.key === key).name,
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
									onNavigation={ (...args) => this.handleNavigation(...args) }
								/>
								<Libraries
									fetchAllCollections={ fetchAllCollections }
									libraries={ libraries }
									librariesWithCollectionsFetching={ librariesWithCollectionsFetching }
									picked={ picked }
									isPickerMode={ true }
									onPickerPick={ (...args) => this.handlePick(...args) }
									view={ this.state.view }
									groups={ groups }
									userLibraryKey={ userLibraryKey }
									libraryKey={ this.state.libraryKey }
									device={ device }
									collections={ collections }
									path={ this.state.path }
									onSelect={ this.handleCollectionSelect }
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
									picked.length > 0 ?
									`${picked.length} ${pluralize('Collection', picked.length)} Selected` :
									'Select a Collection'
								}
							</h4>
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={ picked.length === 0}
								className="btn-link"
								onClick={ this.handleAddItems }
							>
								Add
							</Button>
						</div>
					</div>
				</div>
			</Modal>
		);
	}

	static propTypes = {
		collectionCountByLibrary: PropTypes.object,
		collections: PropTypes.objectOf(PropTypes.arrayOf(Types.collection)),
		device: PropTypes.object,
		fetchAllCollections: PropTypes.func.isRequired,
		groups: PropTypes.array,
		isOpen: PropTypes.bool,
		libraries: PropTypes.array,
		librariesWithCollectionsFetching: PropTypes.array,
		libraryKey: PropTypes.string,
		toggleModal: PropTypes.func.isRequired,
		userLibraryKey: PropTypes.string,
		addToCollection: PropTypes.func.isRequired,
		items: PropTypes.array,
		onSelectModeToggle: PropTypes.func.isRequired,
	}
}

export default AddItemsToCollectionsModal;

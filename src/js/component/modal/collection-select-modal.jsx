'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { makeChildMap } = require('../../common/collection');
const Libraries = require('../libraries');
const Modal = require('../ui/modal');
const Button = require('../ui/button');
const Spinner = require('../ui/spinner');
const TouchHeader = require('../touch-header.jsx');
const { pluralize } = require('../../common/format');
const defaultState = {
	view: 'libraries',
	libraryKey: '',
	path: [],
	picked: [],
};
const PAGE_SIZE = 100;

class CollectionSelectModal extends React.PureComponent {
	state = defaultState

	componentDidUpdate({ isOpen: wasOpen }, { libraryKey: prevLibraryKey }) {
		const { isOpen, userLibraryKey, fetchCollections,
		librariesWithCollectionsFetching, collectionCountByLibrary,
		groupCollections } = this.props;
		const { libraryKey } = this.state;

		if(wasOpen && !isOpen) {
			this.setState(defaultState);
		}

		if(libraryKey && libraryKey !== prevLibraryKey && userLibraryKey !== libraryKey) {
			fetchCollections(libraryKey, { start: 0, limit: PAGE_SIZE });
		}

		const fetchNextPage = (libraryKey, collections) => {
			if(!librariesWithCollectionsFetching.includes(libraryKey) &&
			collectionCountByLibrary[libraryKey] > collections.length) {
				fetchCollections(libraryKey, { start: collections.length, limit: PAGE_SIZE });
			}
		}

		Object.keys(groupCollections).forEach(groupId => {
			if(groupId in collectionCountByLibrary) {
				fetchNextPage(groupId, groupCollections[groupId]);
			}
		});
	}

	handleCollectionUpdate = async () => {
		const { addToCollection, items, toggleModal, onSelectModeToggle } = this.props;
		const { picked } = this.state;


		if(this.state.picked.length) {
			this.setState({ isBusy: true })
			const promises = picked.map(
				targetData => addToCollection(
					items, targetData.collection, targetData.library
				)
			);
			await Promise.all(promises);
			this.setState({ isBusy: false });
			toggleModal(null, false);
			onSelectModeToggle(false);
		}
	}

	handleCollectionSelect = ({ library = null,  collection = null } = {}) => {
		const { collections, groupCollections, userLibraryKey } = this.props;

		if(library) {
			if(collection) {
				const childMap = library === userLibraryKey ?
				collections.length ? makeChildMap(collections) : {} :
				library in groupCollections && groupCollections[library].length ?
					makeChildMap(groupCollections[library]) : {};
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
			userLibraryKey, groups, groupCollections,
			librariesWithCollectionsFetching } = this.props;
		const { libraryKey, isBusy, picked } = this.state;
		const collectionsSource = libraryKey === userLibraryKey ?
			collections : (groupCollections[libraryKey] || []);

		const touchHeaderPath = this.state.path.map(key => ({
				key,
				type: 'collection',
				label: collectionsSource.find(c => c.key === key).name,
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
					(groups.find(g => g.id === parseInt(libraryKey.substr(1), 10)) || {}).name || libraryKey
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
									path={ touchHeaderPath }
									onNavigation={ (...args) => this.handleNavigation(...args) }
								/>
								<Libraries
									librariesWithCollectionsFetching={ librariesWithCollectionsFetching }
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
								onClick={ this.handleCollectionUpdate }
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

/* eslint-disable react/no-deprecated */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const { bindActionCreators } = require('redux');
const Libraries = require('../component/libraries');
const {
	fetchCollections,
	createCollection,
	updateCollection,
	deleteCollection,
	toggleModal,
} = require('../actions');
const { getCollectionsPath } = require('../common/state');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const { getLibraries } = require('../common/state');
const withDevice = require('../enhancers/with-device');
const PAGE_SIZE = 100;

class LibrariesContainer extends React.PureComponent {
	constructor(props) {
		super(props);

		const { dispatch, libraryKey, userLibraryKey } = props;

		dispatch(fetchCollections(userLibraryKey, { start: 0, limit: PAGE_SIZE }));

		if(libraryKey !== userLibraryKey) {
			dispatch(fetchCollections(libraryKey, { start: 0, limit: PAGE_SIZE }));
		}
	}

	componentDidUpdate({ libraryKey: prevLibraryKey }) {
		const { collectionCountByLibrary, collections, libraryKey, userLibraryKey, dispatch, librariesWithCollectionsFetching } = this.props;
		if(libraryKey !== prevLibraryKey && libraryKey !== userLibraryKey) {
			dispatch(fetchCollections(libraryKey, { start: 0, limit: PAGE_SIZE }));
		}

		const fetchNextPage = (libraryKey, collections) => {
			if(!librariesWithCollectionsFetching.includes(libraryKey) &&
			collectionCountByLibrary[libraryKey] > collections.length) {
				dispatch(fetchCollections(libraryKey, { start: collections.length, limit: PAGE_SIZE }));
			}
		}

		Object.keys(collections).forEach(libraryId => {
			if(libraryId in collectionCountByLibrary) {
				fetchNextPage(libraryId, collections[libraryId]);
			}
		});
	}

	handleSelect(pathData) {
		this.props.push(makePath(pathData));
	}

	async handleCollectionAdd(libraryKey, parentCollection, name) {
		return await this.props.dispatch(createCollection({
			name, parentCollection
		}, libraryKey));
	}

	async handleCollectionUpdate(libraryKey, collectionKey, patch) {
		await this.props.dispatch(updateCollection(collectionKey, patch, libraryKey));
	}

	async handleCollectionDelete(libraryKey, collection) {
		await this.props.dispatch(deleteCollection(collection, libraryKey));
		this.props.push('/');
	}

	async handleGroupOpen(groupKey) {
		const { dispatch } = this.props;
		await dispatch(fetchCollections(groupKey, { start: 0, limit: PAGE_SIZE }));
	}

	render() {
		return <Libraries
			{ ...this.props }
			onSelect={ this.handleSelect.bind(this) }
			onCollectionAdd={ this.handleCollectionAdd.bind(this) }
			onCollectionUpdate={ this.handleCollectionUpdate.bind(this) }
			onCollectionDelete={ this.handleCollectionDelete.bind(this) }
			onGroupOpen={ this.handleGroupOpen.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	const {
		libraryKey,
		userLibraryKey,
		collectionKey,
		view,
		itemsSource
	} = state.current;
	const libraries = getLibraries(state);

	return {
		collections: libraries.reduce((aggr, library) => {
			aggr[library.key] = Object.values(
				get(state, ['libraries', library.key, 'collections'], {})
			);
			return aggr;
		}, {}),
		collectionCountByLibrary: state.collectionCountByLibrary,
		librariesWithCollectionsFetching: state.fetching.collectionsInLibrary,
		userLibraryKey,
		isFetching: libraryKey in state.fetching.collectionsInLibrary,
		libraries,
		libraryKey,
		selected: collectionKey,
		path: getCollectionsPath(state),
		view,
		itemsSource,
		updating: Object.keys(get(state, ['libraries', libraryKey, 'updating', 'collections'], {}))
	};
};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push, toggleModal }, dispatch) });

LibrariesContainer.propTypes = {
	// collections: PropTypes.object,
	dispatch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	path: PropTypes.array,
	selected: PropTypes.string,
};

LibrariesContainer.defaultProps = {
	collections: {},
	path: [],
	selected: ''
};

module.exports = withDevice(connect(
	mapStateToProps,
	mapDispatchToProps
)(LibrariesContainer));

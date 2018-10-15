/* eslint-disable react/no-deprecated */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const Libraries = require('../component/libraries');
const {
	fetchCollections,
	createCollection,
	updateCollection,
	deleteCollection,
} = require('../actions');
const { getCollectionsPath } = require('../common/state');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const PAGE_SIZE = 100;

class LibrariesContainer extends React.Component {
	componentDidMount() {
		const { dispatch, userLibraryKey } = this.props;
		dispatch(fetchCollections(userLibraryKey, { start: 0, limit: PAGE_SIZE }));
	}

	componentDidUpdate({ libraryKey: prevLibraryKey }) {
		const { collectionCountByLibrary, collections, groupCollections, libraryKey, userLibraryKey, dispatch, collectionsBeingFetched } = this.props;
		if(libraryKey != prevLibraryKey && libraryKey !== userLibraryKey) {
			dispatch(fetchCollections(libraryKey, { start: 0, limit: PAGE_SIZE }));
		}

		const fetchNextPage = (libraryKey, collections) => {
			if(!collectionsBeingFetched.includes(libraryKey) &&
			collectionCountByLibrary[libraryKey] > collections.length) {
				dispatch(fetchCollections(libraryKey, { start: collections.length, limit: PAGE_SIZE }));
			}
		}

		if(userLibraryKey in collectionCountByLibrary) {
			fetchNextPage(userLibraryKey, collections);
		}

		Object.keys(groupCollections).forEach(groupId => {
			if(groupId in collectionCountByLibrary) {
				fetchNextPage(groupId, groupCollections[groupId]);
			}
		});
	}

	handleSelect(pathData) {
		this.props.history.push(makePath(pathData));
	}

	async handleCollectionAdd(libraryKey, name, parentCollection = null) {
		return await this.props.dispatch(createCollection(libraryKey, {
			name, parentCollection
		}));
	}

	async handleCollectionUpdate(libraryKey, collectionKey, patch) {
		await this.props.dispatch(updateCollection(libraryKey, collectionKey, patch));
	}

	async handleCollectionDelete(libraryKey, collection) {
		await this.props.dispatch(deleteCollection(libraryKey, collection));
		this.props.history.push('/');
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
	const libraryKey = state.current.library;
	const userLibraryKey = state.config.userLibraryKey;

	return {
		libraryKey,
		collections: Object.values(
			get(state, ['libraries', userLibraryKey, 'collections'], {})
		),
		collectionCountByLibrary: state.collectionCountByLibrary,
		collectionsBeingFetched: state.fetching.collectionsInLibrary,
		userLibraryKey,
		groups: state.groups,
		groupCollections: state.groups.reduce((aggr, group) => {
			aggr[`g${group.id}`] = Object.values(
				get(state, ['libraries', `g${group.id}`, 'collections'], {})
			);
			return aggr;
		}, {}),
		isFetching: libraryKey in state.fetching.collectionsInLibrary,
		selected: state.current.collection,
		path: getCollectionsPath(state),
		itemsSource: state.current.itemsSource,
		updating: Object.keys(get(state, ['libraries', libraryKey, 'updating', 'collections'], {}))
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch
	};
};

LibrariesContainer.propTypes = {
	collections: PropTypes.array,
	dispatch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	path: PropTypes.array,
	selected: PropTypes.string,
};

LibrariesContainer.defaultProps = {
	collections: [],
	path: [],
	selected: ''
};

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(LibrariesContainer));

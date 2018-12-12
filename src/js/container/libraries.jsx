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
} = require('../actions');
const { getCollectionsPath } = require('../common/state');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');
const { getCurrent } = require('../common/state');
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
		const { collectionCountByLibrary, collections, groupCollections, libraryKey, userLibraryKey, dispatch, librariesWithCollectionsFetching } = this.props;
		if(libraryKey !== prevLibraryKey && libraryKey !== userLibraryKey) {
			dispatch(fetchCollections(libraryKey, { start: 0, limit: PAGE_SIZE }));
		}

		const fetchNextPage = (libraryKey, collections) => {
			if(!librariesWithCollectionsFetching.includes(libraryKey) &&
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
	} = getCurrent(state);

	return {
		libraryKey,
		collections: Object.values(
			get(state, ['libraries', userLibraryKey, 'collections'], {})
		),
		collectionCountByLibrary: state.collectionCountByLibrary,
		librariesWithCollectionsFetching: state.fetching.collectionsInLibrary,
		userLibraryKey,
		groups: state.groups,
		groupCollections: state.groups.reduce((aggr, group) => {
			aggr[`g${group.id}`] = Object.values(
				get(state, ['libraries', `g${group.id}`, 'collections'], {})
			);
			return aggr;
		}, {}),
		isFetching: libraryKey in state.fetching.collectionsInLibrary,
		selected: collectionKey,
		path: getCollectionsPath(state),
		view,
		itemsSource,
		updating: Object.keys(get(state, ['libraries', libraryKey, 'updating', 'collections'], {}))
	};
};

//@TODO: bind all action creators
const mapDispatchToProps = dispatch => ({ dispatch, ...bindActionCreators({ push }, dispatch) });

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

module.exports = withDevice(connect(
	mapStateToProps,
	mapDispatchToProps
)(LibrariesContainer));

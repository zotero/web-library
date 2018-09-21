/* eslint-disable react/no-deprecated */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const CollectionTree = require('../component/collection-tree');
const {
	fetchCollections,
	createCollection,
	updateCollection,
	deleteCollection,
} = require('../actions');
const { getCollectionsPath } = require('../common/state');
const { get } = require('../utils');
const { makePath } = require('../common/navigation');

class CollectionTreeContainer extends React.Component {
	componentDidMount() {
		this.props.dispatch(
			fetchCollections(this.props.userLibraryKey)
		);
	}

	handleSelect(pathData) {
		this.props.history.push(makePath(pathData));
	}

	async handleCollectionAdd(name, parentCollection = null) {
		return await this.props.dispatch(createCollection({
			name, parentCollection
		}));
	}

	async handleCollectionUpdate(collectionKey, patch) {
		await this.props.dispatch(updateCollection(collectionKey, patch));
	}

	async handleCollectionDelete(collection) {
		await this.props.dispatch(deleteCollection(collection));
		this.props.history.push('/');
	}

	render() {
		return <CollectionTree
			{ ...this.props }
			onSelect={ this.handleSelect.bind(this) }
			onCollectionAdd={ this.handleCollectionAdd.bind(this) }
			onCollectionUpdate={ this.handleCollectionUpdate.bind(this) }
			onCollectionDelete={ this.handleCollectionDelete.bind(this) }
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
		userLibraryKey,
		groups: state.groups,
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

CollectionTreeContainer.propTypes = {
	collections: PropTypes.array,
	dispatch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool.isRequired,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	path: PropTypes.array,
	selected: PropTypes.string,
};

CollectionTreeContainer.defaultProps = {
	collections: [],
	path: [],
	selected: ''
};

module.exports = withRouter(connect(
	mapStateToProps,
	mapDispatchToProps
)(CollectionTreeContainer));

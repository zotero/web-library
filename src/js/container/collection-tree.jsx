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

class CollectionTreeContainer extends React.Component {
	componentWillReceiveProps(nextProps) {
		if((!this.props.libraryKey && nextProps.libraryKey) || (this.props.libraryKey != nextProps.libraryKey)) {
			this.props.dispatch(
				fetchCollections(nextProps.libraryKey)
			);
		}
	}

	handleSelect(nodeType, collectionKey) {
		switch(nodeType) {
			case 'top':
				this.props.history.push('/');
			break;
			case 'trash':
				this.props.history.push('/trash');
			break;
			case 'collection':
				this.props.history.push(`/collection/${collectionKey}`);
			break;
			case 'items':
				this.props.history.push(`/collection/${collectionKey}/item-list`);
			break;
		}
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

	return {
		libraryKey,
		collections: Object.values(
			get(state, ['libraries', libraryKey, 'collections'], {})
		),
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

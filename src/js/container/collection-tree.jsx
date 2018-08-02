/* eslint-disable react/no-deprecated */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const CollectionTree = require('../component/collection-tree');
const { fetchCollections, createCollection } = require('../actions');
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

	handleSelect(itemsSource, collectionKey) {
		switch(itemsSource) {
			case 'top':
				this.props.history.push('/');
			break;
			case 'trash':
				this.props.history.push('/trash');
			break;
			case 'collection':
				this.props.history.push(`/collection/${collectionKey}`);
			break;
		}
	}

	async handleCollectionAdd(name, parentCollection = null) {
		return await this.props.dispatch(createCollection({
			name, parentCollection
		}));
	}

	render() {
		return <CollectionTree
			collections={ this.props.collections }
			path={ this.props.path }
			isFetching={ this.props.isFetching }
			onSelect={ this.handleSelect.bind(this) }
			itemsSource={ this.props.itemsSource }
			onCollectionAdd={ this.handleCollectionAdd.bind(this) }
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
		isFetching: libraryKey in state.fetching.collectionsInLibrary,
		selected: state.current.collection,
		path: getCollectionsPath(state),
		itemsSource: state.current.itemsSource
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

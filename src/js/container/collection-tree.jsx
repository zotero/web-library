/* eslint-disable react/no-deprecated */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const CollectionTree = require('../component/collection-tree');
const { fetchCollections } = require('../actions');
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

	onCollectionSelected(collectionKey) {
		if(collectionKey) {
			this.props.history.push(`/collection/${collectionKey}`);
		} else {
			this.props.history.push('/');
		}
	}

	render() {
		return <CollectionTree
			collections={ this.props.collections }
			path={ this.props.path }
			isFetching={ this.props.isFetching }
			onCollectionSelected={ this.onCollectionSelected.bind(this) }
			isTopLevel={ this.props.isTopLevel }
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
		isTopLevel: !state.current.collection
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch
	};
};

CollectionTreeContainer.propTypes = {
	libraryKey: PropTypes.string,
	collections: PropTypes.array,
	isFetching: PropTypes.bool.isRequired,
	dispatch: PropTypes.func.isRequired,
	selected: PropTypes.string,
	path: PropTypes.array
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

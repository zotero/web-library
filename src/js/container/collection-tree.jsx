'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const CollectionTree = require('../component/collection-tree');
const { fetchCollections } = require('../actions');
const { getCollections, getCollectionsPath } = require('../state-utils');
const { enhanceCollections } = require('../utils');


class CollectionTreeContainer extends React.Component {
	constructor(props) {
		super();
		this.state = {
			collections: enhanceCollections(props.collections, props.path)
		};
	}

	componentWillReceiveProps(nextProps) {
		if((!this.props.libraryKey && nextProps.libraryKey) || (this.props.libraryKey != nextProps.libraryKey)) {
			this.props.dispatch(
				fetchCollections(nextProps.libraryKey)
			);
		}
		
		if('selected' in nextProps && nextProps.selected != this.props.selected ||
			'collections' in nextProps && nextProps.collections != this.props.collections) {
			this.setState({
				collections: enhanceCollections(nextProps.collections, nextProps.path)
			});
		}
	}

	toggleOpenCollection(collectionKey) {
		this.setState({
			collections: this.state.collections.map(c => {
				if(c.key === collectionKey) {
					c.isOpen = !c.isOpen;
				}
				return c;
			})
		});
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
			collections={this.state.collections}
			path={this.state.path}
			isFetching={this.props.isFetching}
			onCollectionOpened={ this.toggleOpenCollection.bind(this) }
			onCollectionSelected={ this.onCollectionSelected.bind(this) }
		/>;
	}
}

const mapStateToProps = state => {
	return {
		libraryKey: 'libraryKey' in state.library ? state.library.libraryKey : null,
		collections: getCollections(state),
		isFetching: state.library && state.collections[state.library.libraryKey] ? state.collections[state.library.libraryKey].isFetching : false,
		selected: 'collection' in state.router.params ? state.router.params.collection : null,
		path: getCollectionsPath(state)
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
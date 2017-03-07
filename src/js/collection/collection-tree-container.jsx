'use strict';

import React from 'react';
import { connect } from 'react-redux';
import CollectionTree from './collection-tree';
import { fetchCollectionsIfNeeded } from '../actions';
import { push } from 'redux-router';
import { getCollections, getPathFromState } from '../state-utils';

const applyTreePath = (collections, path, reopen) => {
	return collections.map(c => {
		let index = path.indexOf(c.key);
		c.isSelected = index >= 0 && index === path.length - 1;
		if(reopen) {
			c.isOpen = index >= 0 && index < path.length - 1;
		} else if(index >= 0 && index < path.length - 1) {
			c.isOpen = true;
		}
		return c;
	});
};

class CollectionTreeContainer extends React.Component {
	constructor(props) {
		super();
		this.state = {
			collections: applyTreePath(props.collections, props.path, props.reopen)
		};
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.library && nextProps.library != this.props.library) {
			this.props.dispatch(
				fetchCollectionsIfNeeded(nextProps.library)
			);
		}
		
		if('selected' in nextProps && nextProps.selected != this.props.selected ||
			'collections' in nextProps && nextProps.collections != this.props.collections) {
			console.log(nextProps.collections, nextProps.path);
			this.setState({
				collections: applyTreePath(nextProps.collections, nextProps.path, nextProps.reopen)
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
		this.props.dispatch(push(`/collection/${collectionKey}`));
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
		library: state.library,
		collections: getCollections(state),
		isFetching: state.library && state.collections[state.library.libraryString] ? state.collections[state.library.libraryString].isFetching : false,
		selected: 'collection' in state.router.params ? state.router.params.collection : null,
		reopen: state.router && state.router.location.action != 'PUSH',
		path: getPathFromState(state)
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch
	};
};

CollectionTreeContainer.propTypes = {
	library: React.PropTypes.object,
	collections: React.PropTypes.array,
	isFetching: React.PropTypes.bool.isRequired,
	dispatch: React.PropTypes.func.isRequired,
	selected: React.PropTypes.string,
	path: React.PropTypes.array,
	reopen: React.PropTypes.bool
};

CollectionTree.defaultProps = {
	collections: [],
	path: [],
	selected: ''
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CollectionTreeContainer);
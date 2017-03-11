'use strict';

import React from 'react';
import { connect } from 'react-redux';
import CollectionTree from './collection-tree';
import { fetchCollectionsIfNeeded } from '../actions';
import { push } from 'redux-router';
import { getCollections, getPathFromState } from '../state-utils';

/**
 * Marks collections as selected/open based on current path
 * @param  {Array} collections Flat list of collections
 * @param  {Array} path        A list of keys containing currently selected collection
 *                             and all of its parents in reverse order (i.e. selected
 *                             collection key is the last element of the array)
 * @return {Array}             Flat list of collections annotated with isSelected 
 *                             and isOpen properties
 */
const applyTreePath = (collections, path) => {
	return collections.map(c => {
		let index = path.indexOf(c.key);
		c.isSelected = index >= 0 && index === path.length - 1;
		if(index >= 0 && index < path.length - 1) {
			c.isOpen = true;
		} else if(index !== -1) {
			c.isOpen = false;
		}
		
		return c;
	});
};

class CollectionTreeContainer extends React.Component {
	constructor(props) {
		super();
		this.state = {
			collections: applyTreePath(props.collections, props.path)
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
			this.setState({
				collections: applyTreePath(nextProps.collections, nextProps.path)
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
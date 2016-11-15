'use strict';

import React from 'react';
import { connect } from 'react-redux';
import CollectionTree from './collection-tree';
import { selectCollection, fetchCollectionsIfNeeded } from '../actions';


const mapTreePath = (selectedKey, collections, curPath) => {
	if(!curPath) {
		curPath = [];
	}
	
	for(let col of collections) {
		if(col.key === selectedKey) {
			return curPath.concat(col.key);
		} else if(col.children.length) {
			let maybePath = mapTreePath(selectedKey, col.children, curPath.concat(col.key));
			if(maybePath.includes(selectedKey)) {
				return maybePath;
			}
		}
	}

	return curPath;
};

class CollectionTreeContainer extends React.Component {
	constructor(props) {
		super();
		this.state = {
			path: mapTreePath(props.selected, props.collections.filter(c => c.nestingDepth === 1))
		};
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.library && nextProps.library != this.props.library) {
			this.props.dispatch(
				fetchCollectionsIfNeeded(nextProps.library)
			);
		}
		
		if(nextProps.selected && nextProps.selected != this.props.selected ||
			nextProps.collections && nextProps.collections != this.props.collections) {
			this.setState({
				path: mapTreePath(nextProps.selected, nextProps.collections.filter(c => c.nestingDepth === 1))
			});
		}
	}

	render() {
		return <CollectionTree 
			collections={this.props.collections}
			path={this.state.path}
			isFetching={this.props.isFetching}
			onCollectionSelected={this.props.onCollectionSelected} 
		/>;
	}
}

const mapStateToProps = state => {
	return {
		library: state.library,
		collections: state.library && state.collections[state.library.libraryString] ? state.collections[state.library.libraryString].collections : [],
		isFetching: state.library && state.collections[state.library.libraryString] ? state.collections[state.library.libraryString].isFetching : false,
		selected: state.router.location.pathname.match(/^\/collection\//) ? state.router.params.key : null
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch,
		onCollectionSelected: collectionKey => {
			dispatch(selectCollection(collectionKey));
		}
	};
};

CollectionTreeContainer.propTypes = {
	onCollectionSelected: React.PropTypes.func.isRequired,
	library: React.PropTypes.object,
	collections: React.PropTypes.array,
	isFetching: React.PropTypes.bool.isRequired,
	dispatch: React.PropTypes.func.isRequired,
	selected: React.PropTypes.string
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(CollectionTreeContainer);
'use strict';

import React from 'react';
import { connect } from 'react-redux';
import CollectionTree from './collection-tree';
import { selectCollection, fetchCollectionsIfNeeded } from '../actions';


class CollectionTreeContainer extends React.Component {
	componentWillReceiveProps(nextProps) {
		if(nextProps.library && nextProps.library != this.props.library) {
			this.props.dispatch(
				fetchCollectionsIfNeeded(nextProps.library)
			);
		}
	}

	render() {
		return <CollectionTree 
			collections={this.props.collections}
			selected={this.props.selected}
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
		selected: state.library && state.collections ? state.collections.selected : null
	};
};

const mapDispatchToProps = dispatch => {
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
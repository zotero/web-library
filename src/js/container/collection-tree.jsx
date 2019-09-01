'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CollectionTree from '../component/libraries/collection-tree';
import { pick } from '../common/immutable';
import { fetchCollections, createCollection, updateCollection, deleteCollection, toggleModal, navigate } from '../actions';

const CollectionTreeContainer = props => <CollectionTree { ...props } />;

const mapStateToProps = (state, ownProps) => {
	const { collectionKey, itemsSource, libraryKey, view } = state.current;
	const { parentLibraryKey } = ownProps;
	const { libraries } = state.config ;

	return {
		collectionsTotalCount: state.collectionCountByLibrary[parentLibraryKey],
		collections: parentLibraryKey in state.libraries ? state.libraries[ownProps.parentLibraryKey].collections : {},
		itemsSource,
		libraries,
		selectedCollectionKey: collectionKey,
		selectedLibraryKey: libraryKey,
		view,
		...pick(ownProps, ['selectedCollectionKey', 'selectedLibraryKey', 'view', 'itemsSource'])
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		...bindActionCreators({ fetchCollections, createCollection, updateCollection,
			deleteCollection, toggleModal, navigate }, dispatch),
		...pick(ownProps, ['navigate'])
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionTreeContainer);

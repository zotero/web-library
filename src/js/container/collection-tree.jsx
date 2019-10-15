'use strict';

import React from 'react';
import { connect } from 'react-redux';

import CollectionTree from '../component/libraries/collection-tree';
import { createAttachmentsFromDropped, fetchCollections, createCollection, updateCollection, deleteCollection,
	toggleModal, navigate } from '../actions';
import { pick } from '../common/immutable';

const CollectionTreeContainer = props => <CollectionTree { ...props } />;

const mapStateToProps = (state, ownProps) => {
	const { collectionKey, itemsSource, libraryKey, view } = state.current;
	const { parentLibraryKey } = ownProps;
	const { libraries } = state.config ;

	return {
		collectionsTotalCount: state.collectionCountByLibrary[parentLibraryKey],
		updating: parentLibraryKey in state.libraries ? state.libraries[parentLibraryKey].updating.collections : {},
		collections: parentLibraryKey in state.libraries ? state.libraries[ownProps.parentLibraryKey].collections : {},
		itemsSource,
		libraries,
		selectedCollectionKey: collectionKey,
		selectedLibraryKey: libraryKey,
		view,
		...pick(ownProps, ['selectedCollectionKey', 'selectedLibraryKey', 'view', 'itemsSource'])
	};
};

export default connect(
	mapStateToProps,
	{ fetchCollections, createAttachmentsFromDropped, createCollection, updateCollection, deleteCollection, toggleModal, navigate }
)(CollectionTreeContainer);

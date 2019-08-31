/* eslint-disable react/no-deprecated */

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import CollectionTree from '../component/libraries/collection-tree';
import { fetchCollections, createCollection, updateCollection, deleteCollection, toggleModal, navigate } from '../actions';

const CollectionTreeContainer = props => <CollectionTree { ...props } />;

const mapStateToProps = state => {
	const { collectionKey, itemsSource, libraryKey, view } = state.current;
	const librariesData = state.libraries;
	const { libraries } = state.config ;

	return {
		collectionCountByLibrary: state.collectionCountByLibrary,
		itemsSource,
		libraries,
		librariesData,
		selectedCollectionKey: collectionKey,
		selectedLibraryKey: libraryKey,
		view,
	};
};

export default connect(mapStateToProps, {
	fetchCollections, createCollection, updateCollection, deleteCollection, toggleModal, navigate }
)(CollectionTreeContainer);

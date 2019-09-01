/* eslint-disable react/no-deprecated */

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

import React from 'react';
import { connect } from 'react-redux';

import Libraries from '../component/libraries';
import withDevice from '../enhancers/with-device';
import { createCollection, deleteCollection, fetchAllCollections, fetchLibrarySettings, navigate,
	toggleModal, updateCollection, } from '../actions';
import { get } from '../utils';

const LibrariesContainer = props => <Libraries { ...props } />;

const mapStateToProps = state => {
	const { libraryKey, view, itemsSource } = state.current;
	const { libraries } = state.config ;
	const collectionCountByLibrary = state.collectionCountByLibrary || {};
	const hasMoreCollections = Object.keys(
		get(state, ['libraries', libraryKey, 'collections'], {})
	) < collectionCountByLibrary[libraryKey];

	return {
		collectionCountByLibrary,
		hasMoreCollections,
		itemsSource,
		libraries,
		librariesWithCollectionsFetching: state.fetching.collectionsInLibrary,
		selectedLibraryKey: libraryKey,
		view,
	};
};

export default withDevice(connect(mapStateToProps, {
	fetchLibrarySettings, navigate, toggleModal, updateCollection, fetchAllCollections,
	createCollection, deleteCollection,
})(LibrariesContainer));

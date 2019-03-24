'use strict';

import React from 'react';
import withDevice from '../enhancers/with-device';
import withSelectMode from '../enhancers/with-select-mode';
import { connect } from 'react-redux';
import { toggleModal, addToCollection, fetchCollections } from '../actions';
import CollectionSelectModal from '../component/modal/collection-select-modal';
import { COLLECTION_SELECT } from '../constants/modals';
import { get } from '../utils';
import { getLibraries } from '../common/state';

class CollectionSelectModalContainer extends React.PureComponent {
	render() {
		return <CollectionSelectModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === COLLECTION_SELECT;
	const { libraryKey, userLibraryKey } = state.current;
	const { items } = state.modal;
	const librariesWithCollectionsFetching = state.fetching.collectionsInLibrary;
	const collectionCountByLibrary = state.collectionCountByLibrary;
	const groups = state.groups;
	const libraries = getLibraries(state);
	const collections = libraries.reduce((aggr, library) => {
		aggr[library.key] = Object.values(
			get(state, ['libraries', library.key, 'collections'], {})
		);
		return aggr;
	}, {});

	return { libraries, libraryKey, isOpen, collections, userLibraryKey, groups,
		items, librariesWithCollectionsFetching, collectionCountByLibrary };
};


export default withSelectMode(withDevice(connect(
	mapStateToProps,
	{ addToCollection, toggleModal, fetchCollections }
)(CollectionSelectModalContainer)));

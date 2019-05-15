'use strict';

import React from 'react';
import { connect } from 'react-redux';

import AddItemsToCollectionsModal from '../../component/modal/add-items-to-collections';
import withDevice from '../../enhancers/with-device';
import withSelectMode from '../../enhancers/with-select-mode';
import { COLLECTION_SELECT } from '../../constants/modals';
import { get } from '../../utils';
import { toggleModal, addToCollection, fetchCollections } from '../../actions';

class AddItemsToCollectionsModalContainer extends React.PureComponent {
	render() {
		return <AddItemsToCollectionsModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === COLLECTION_SELECT;
	const { libraryKey, userLibraryKey } = state.current;
	const { items } = state.modal;
	const librariesWithCollectionsFetching = state.fetching.collectionsInLibrary;
	const collectionCountByLibrary = state.collectionCountByLibrary;
	const groups = state.groups;
	const libraries = state.config.libraries.filter(l => !l.isReadOnly);
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
)(AddItemsToCollectionsModalContainer)));

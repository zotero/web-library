'use strict';

const React = require('react');

const withDevice = require('../enhancers/with-device');
const withSelectMode = require('../enhancers/with-select-mode');
const { connect } = require('react-redux');
const { toggleModal, addToCollection, fetchCollections } = require('../actions');
const CollectionSelectModal = require('../component/modal/collection-select-modal')
const { COLLECTION_SELECT } = require('../constants/modals');
const { get } = require('../utils');

class CollectionRenameModalContainer extends React.PureComponent {
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
	const groupCollections = state.groups.reduce((aggr, group) => {
		aggr[`g${group.id}`] = Object.values(
			get(state, ['libraries', `g${group.id}`, 'collections'], {})
		);
		return aggr;
	}, {});
	const collections = Object.values(
		get(state, ['libraries', libraryKey, 'collections'], {})
	);

	return { libraryKey, isOpen, collections, userLibraryKey, groups,
		groupCollections, items, librariesWithCollectionsFetching,
		collectionCountByLibrary };
};


module.exports = withSelectMode(withDevice(connect(
	mapStateToProps,
	{ addToCollection, toggleModal, fetchCollections }
)(CollectionRenameModalContainer)));

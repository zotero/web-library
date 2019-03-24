'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { toggleModal, updateCollection } from '../actions';
import CollectionRenameModal from '../component/modal/collection-rename-modal';
import { COLLECTION_RENAME } from '../constants/modals';
import { get } from '../utils';

class CollectionRenameModalContainer extends React.PureComponent {
	render() {
		return <CollectionRenameModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === COLLECTION_RENAME;
	const { libraryKey } = state.current;
	const { collectionKey } = state.modal;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);
	const collections = Object.values(
		get(state, ['libraries', libraryKey, 'collections'], {})
	);

	return { libraryKey, isOpen, collection, collections };
};


export default connect(
	mapStateToProps,
	{ updateCollection, toggleModal }
)(CollectionRenameModalContainer);

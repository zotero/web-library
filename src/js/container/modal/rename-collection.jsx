'use strict';

import React from 'react';
import { connect } from 'react-redux';

import RenameCollectionModal from '../../component/modal/rename-collection-modal';
import { COLLECTION_RENAME } from '../../constants/modals';
import { get } from '../../utils';
import { toggleModal, updateCollection } from '../../actions';

class RenameCollectionModalContainer extends React.PureComponent {
	render() {
		return <RenameCollectionModal { ...this.props } />;
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
)(RenameCollectionModalContainer);

'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { toggleModal, createCollection } from '../actions';
import CollectionAddModal from '../component/modal/collection-add-modal';
import { COLLECTION_ADD } from '../constants/modals';
import { get } from '../utils';

class CollectionAddModalContainer extends React.PureComponent {
	render() {
		return <CollectionAddModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === COLLECTION_ADD;
	const { libraryKey } = state.current;
	const { parentCollectionKey } = state.modal;
	const parentCollection = get(state, ['libraries', libraryKey, 'collections', parentCollectionKey]);

	return { libraryKey, isOpen, parentCollection };
};


export default connect(
	mapStateToProps,
	{ createCollection, toggleModal }
)(CollectionAddModalContainer);

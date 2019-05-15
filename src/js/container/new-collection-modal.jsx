'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { toggleModal, createCollection } from '../actions';
import NewCollectionModal from '../component/modal/new-collection';
import { COLLECTION_ADD } from '../constants/modals';
import { get } from '../utils';

class NewCollectionModalContainer extends React.PureComponent {
	render() {
		return <NewCollectionModal { ...this.props } />;
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
)(NewCollectionModalContainer);

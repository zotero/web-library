'use strict';

import React from 'react';
import { connect } from 'react-redux';

import NewFileModal from '../../component/modal/new-file';
import { get } from '../../utils';
import { NEW_FILE } from '../../constants/modals';
import { toggleModal, createItem, fetchItemTemplate, uploadAttachment } from '../../actions';

const NewFileModalContainer = props => <NewFileModal { ...props } />;

const mapStateToProps = state => {
	const isOpen = state.modal.id === NEW_FILE;
	const { libraryKey } = state.current;
	const { collectionKey } = state.modal;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);

	return { collection, libraryKey, isOpen };
};


export default connect(
	mapStateToProps,
	{ createItem, fetchItemTemplate, toggleModal, uploadAttachment }
)(NewFileModalContainer);

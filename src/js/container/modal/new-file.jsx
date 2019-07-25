'use strict';

import React from 'react';
import { connect } from 'react-redux';

import NewFileModal from '../../component/modal/new-file';
import { get } from '../../utils';
import { NEW_FILE } from '../../constants/modals';
import { toggleModal, createItems, fetchItemTemplate, uploadAttachment, navigate } from '../../actions';

const NewFileModalContainer = props => <NewFileModal { ...props } />;

const mapStateToProps = state => {
	const isOpen = state.modal.id === NEW_FILE;
	const { collectionKey, libraryKey } = state.current;
	const { files } = state.modal;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);

	return { collection, files, libraryKey, isOpen };
};


export default connect(
	mapStateToProps,
	{ createItems, fetchItemTemplate, toggleModal, uploadAttachment, navigate }
)(NewFileModalContainer);

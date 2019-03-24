'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { toggleModal, createItem, fetchItemTemplate, triggerEditingItem } from '../actions';
import NewItemModal from '../component/modal/new-item-modal';
import { NEW_ITEM } from '../constants/modals';
import { get } from '../utils';

class NewItemModalContainer extends React.PureComponent {
	render() {
		return <NewItemModal
			onNewItemCreate={ itemType => this.handleNewItemCreate(itemType) }
			{ ...this.props }
		/>;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === NEW_ITEM;
	const { libraryKey, itemsSource, tags, search } = state.current;
	const { collectionKey } = state.modal;
	const itemTypes = state.meta.itemTypes;
	const collection = get(state, ['libraries', libraryKey, 'collections', collectionKey]);

	return { collection, libraryKey, itemsSource, itemTypes, isOpen, tags, search };
};


export default connect(
	mapStateToProps,
	{ createItem, fetchItemTemplate, toggleModal, triggerEditingItem, push }
)(NewItemModalContainer);

'use strict';

const React = require('react');

const { connect } = require('react-redux');
const { push } = require('connected-react-router');
const { toggleModal, createItem, fetchItemTemplate,
	triggerEditingItem } = require('../actions');
const NewItemModal = require('../component/modal/new-item-modal')
const { NEW_ITEM } = require('../constants/modals');
const { get } = require('../utils');

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


module.exports = connect(
	mapStateToProps,
	{ createItem, fetchItemTemplate, toggleModal, triggerEditingItem, push }
)(NewItemModalContainer);

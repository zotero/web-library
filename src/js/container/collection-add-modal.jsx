'use strict';

const React = require('react');

const { connect } = require('react-redux');
const { toggleModal, createCollection } = require('../actions');
const CollectionAddModal = require('../component/modal/collection-add-modal')
const { COLLECTION_ADD } = require('../constants/modals');
const { get } = require('../utils');

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


module.exports = connect(
	mapStateToProps,
	{ createCollection, toggleModal }
)(CollectionAddModalContainer);

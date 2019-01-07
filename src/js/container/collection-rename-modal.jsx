'use strict';

const React = require('react');

const { connect } = require('react-redux');
const { toggleModal, updateCollection } = require('../actions');
const CollectionRenameModal = require('../component/modal/collection-rename-modal')
const { COLLECTION_RENAME } = require('../constants/modals');
const { get } = require('../utils');

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

	return { libraryKey, isOpen, collection };
};


module.exports = connect(
	mapStateToProps,
	{ updateCollection, toggleModal }
)(CollectionRenameModalContainer);

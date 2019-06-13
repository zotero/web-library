'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { createItem, navigate, searchIdentifier, resetIdentifier, toggleModal } from '../../actions';
import { ADD_BY_IDENTIFIER } from '../../constants/modals';
import AddByIdentifierModal from '../../component/modal/add-by-identifier';
import withDevice from '../../enhancers/with-device';

class AddByIdentifierModalContainer extends React.PureComponent {
	render() {
		return <AddByIdentifierModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === ADD_BY_IDENTIFIER;
	const { isError, reviewItem, isSearching } = state.identifier;
	const { libraryKey, collectionKey, itemsSource } = state.current;
	return { isError, isOpen, reviewItem, isSearching, libraryKey, collectionKey, itemsSource };
}

const mapDispatchToProps = { createItem, navigate, resetIdentifier, searchIdentifier, toggleModal };

export default withDevice(connect(mapStateToProps, mapDispatchToProps)(
	AddByIdentifierModalContainer
));

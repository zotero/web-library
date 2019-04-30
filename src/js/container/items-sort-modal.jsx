'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { toggleModal, updateCollection } from '../actions';
import ItemsSortModal from '../component/modal/items-sort-modal';
import withSortItems from '../enhancers/with-sort-items';
import { SORT_ITEMS } from '../constants/modals';


class ItemsSortModalContainer extends React.PureComponent {
	render() {
		return <ItemsSortModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === SORT_ITEMS;
	return { isOpen };
};


export default withSortItems(
	connect(mapStateToProps, { updateCollection, toggleModal }
)(ItemsSortModalContainer));

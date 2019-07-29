'use strict';

import React from 'react';
import { connect } from 'react-redux';

import ItemsSortModal from '../../component/modal/items-sort-modal';
import withDevice from '../../enhancers/with-device.js';
import withSortItems from '../../enhancers/with-sort-items';
import { SORT_ITEMS } from '../../constants/modals';
import { toggleModal, updateCollection } from '../../actions';


class ItemsSortModalContainer extends React.PureComponent {
	render() {
		return <ItemsSortModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === SORT_ITEMS;
	return { isOpen };
};


export default withDevice(withSortItems(
	connect(mapStateToProps, { updateCollection, toggleModal }
)(ItemsSortModalContainer)));

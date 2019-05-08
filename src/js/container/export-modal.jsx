'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withDevice from '../enhancers/with-device';
import withSelectMode from '../enhancers/with-select-mode';
import { exportCollection, exportItems, toggleModal } from '../actions';
import ExportModal from '../component/modal/export-modal';
import { EXPORT } from '../constants/modals';

class ExportContainer extends React.PureComponent {
	handleCancel = async () => {
		const { toggleModal } = this.props;
		await toggleModal(EXPORT, false);
	}

	render() {
		return <ExportModal
			onCancel={ this.handleCancel }
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === EXPORT;
	const { itemKeys, libraryKey, collectionKey } = state.modal;

	return { collectionKey, isOpen, itemKeys, libraryKey };
};


export default withSelectMode(withDevice(
	connect(mapStateToProps, { exportCollection, exportItems, toggleModal })(ExportContainer)
));

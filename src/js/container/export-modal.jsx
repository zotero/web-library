'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withSelectMode from '../enhancers/with-select-mode';
import { toggleModal, exportItems } from '../actions';
import ExportModal from '../component/modal/export-modal';
import { EXPORT } from '../constants/modals';

class ExportContainer extends React.PureComponent {
	async handleCancel() {
		const { dispatch } = this.props;
		await dispatch(toggleModal(EXPORT, false));
	}

	render() {
		return <ExportModal
			onCancel={ this.handleCancel.bind(this) }
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === EXPORT;
	const { itemKeys } = state.current;

	return { isOpen, itemKeys };
};


export default withSelectMode(
	connect(mapStateToProps, { toggleModal, exportItems })(ExportContainer)
);

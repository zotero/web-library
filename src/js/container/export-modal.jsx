'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');

const { toggleModal, exportItems } = require('../actions');
const ExportModal = require('../component/modal/export-modal')
const { EXPORT } = require('../constants/modals');

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


module.exports = connect(mapStateToProps, { toggleModal, exportItems })(ExportContainer);

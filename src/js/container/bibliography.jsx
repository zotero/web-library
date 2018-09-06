'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { toggleModal, citeItems } = require('../actions');
const Bibliography = require('../component/bibliography')

class BibliographyContainer extends React.PureComponent {
	async componentDidUpdate({ isOpen: wasOpen }) {
		const { dispatch, isOpen, itemKeys } = this.props;

		if(isOpen && !wasOpen) {
			const citations = await dispatch(citeItems(itemKeys));
			this.setState({ citations });
		}
	}

	async handleCancel() {
		const { dispatch } = this.props;
		await dispatch(toggleModal('BIBLIOGRAPHY', false));
	}

	render() {
		return <Bibliography
			onCancel={ this.handleCancel.bind(this) }
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal == 'BIBLIOGRAPHY';
	const itemKeys = state.current.itemKeys;

	return { isOpen, itemKeys };
};


module.exports = withRouter(connect(mapStateToProps)(BibliographyContainer));

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const { withRouter } = require('react-router-dom');
const { connect } = require('react-redux');
const { toggleModal, citeItems } = require('../actions');
const { coreCitationStyles } = require('../../../data/citation-styles-data.json');
const Bibliography = require('../component/bibliography')

class BibliographyContainer extends React.PureComponent {
	state = {
		citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
		isReady: false,
		isUpdating: false
	}

	async componentDidUpdate({ isOpen: wasOpen }, { citationStyle: prevCitationStyle }) {
		const { dispatch, isOpen, itemKeys } = this.props;
		const { citationStyle } = this.state;

		console.log(isOpen, wasOpen, citationStyle, prevCitationStyle);

		if((isOpen && !wasOpen) || citationStyle !== prevCitationStyle) {
			this.setState({ isUpdating: true });
			try {
				const citations = await dispatch(citeItems(itemKeys, citationStyle));
				this.setState({ citations });
			} finally {
				this.setState({ isUpdating: false, isReady: true });
			}
		}
	}

	handleCitationStyleChange(citationStyle) {
		this.setState({ citationStyle });
	}

	async handleCancel() {
		const { dispatch } = this.props;
		await dispatch(toggleModal('BIBLIOGRAPHY', false));
	}

	render() {
		const { citationStyle } = this.state;

		return <Bibliography
			onCancel={ this.handleCancel.bind(this) }
			onCitationStyleChanged={ this.handleCitationStyleChange.bind(this) }
			citationStyle={ citationStyle }
			citationStyles={ coreCitationStyles }
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal === 'BIBLIOGRAPHY';
	const itemKeys = state.current.itemKeys;

	return { isOpen, itemKeys };
};


module.exports = withRouter(connect(mapStateToProps)(BibliographyContainer));

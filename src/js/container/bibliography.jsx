'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { connect } = require('react-redux');
const { toggleModal, bibliographyItems } = require('../actions');
const { coreCitationStyles } = require('../../../data/citation-styles-data.json');
const Bibliography = require('../component/bibliography')
const { BIBLIOGRAPHY } = require('../constants/modals');

class BibliographyContainer extends React.PureComponent {
	state = {
		citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
		isReady: false,
		isUpdating: false
	}

	async componentDidUpdate({ isOpen: wasOpen }, { citationStyle: prevCitationStyle }) {
		const { dispatch, isOpen, itemKeys } = this.props;
		const { citationStyle } = this.state;

		if((isOpen && !wasOpen) || citationStyle !== prevCitationStyle) {
			this.setState({ isUpdating: true });
			try {
				const bibliography = await dispatch(bibliographyItems(itemKeys, citationStyle));
				this.setState({ bibliography });
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
		await dispatch(toggleModal(BIBLIOGRAPHY, false));
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
	const isOpen = state.modal.id === BIBLIOGRAPHY;
	const { itemKeys } = state.current;

	return { isOpen, itemKeys };
};


module.exports = connect(mapStateToProps)(BibliographyContainer);

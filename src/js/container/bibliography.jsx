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
		locale: 'en-US',
		isReady: false,
		isUpdating: false
	}

	async componentDidUpdate({ isOpen: wasOpen }, { citationStyle: prevCitationStyle, locale: prevLocale }) {
		const { dispatch, isOpen, itemKeys } = this.props;
		const { citationStyle, locale } = this.state;

		if((isOpen && !wasOpen) || citationStyle !== prevCitationStyle || locale !== prevLocale) {
			this.setState({ isUpdating: true });
			try {
				const bibliography = await dispatch(bibliographyItems(itemKeys, citationStyle, locale));
				this.setState({ bibliography });
			} finally {
				this.setState({ isUpdating: false, isReady: true });
			}
		}
	}

	handleStyleChange = citationStyle => {
		this.setState({ citationStyle });
	}

	handleLocaleChange = locale => {
		this.setState({ locale });
	}

	handleCancel = async () => {
		const { dispatch } = this.props;
		await dispatch(toggleModal(BIBLIOGRAPHY, false));
	}

	render() {
		const { citationStyle } = this.state;

		return <Bibliography
			onCancel={ this.handleCancel }
			onStyleChange={ this.handleStyleChange }
			onLocaleChange={ this.handleLocaleChange }
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

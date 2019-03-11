'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const copy = require('copy-to-clipboard');

const { connect } = require('react-redux');
const { toggleModal, bibliographyItems } = require('../actions');
const { coreCitationStyles } = require('../../../data/citation-styles-data.json');
const BibliographyModal = require('../component/modal/bibliography');
const { BIBLIOGRAPHY } = require('../constants/modals');
const { stripTagsUsingDOM } = require('../common/format');
const withDevice = require('../enhancers/with-device');
const withSelectMode = require('../enhancers/with-select-mode');


class BibliographyModalContainer extends React.PureComponent {
	state = {
		citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
		locale: 'en-US',
		isReady: false,
		isUpdating: false
	}

	componentDidMount() {
		document.addEventListener('copy', this.handleCopy);
	}

	componentWillUnmount() {
		document.removeEventListener('copy', this.handleCopy);
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
				this.setState({ isUpdating: false });
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

	handleCopyToClipboardClick = () => {
		const bibliography = this.state.bibliography.join('');
		const bibliographyText = stripTagsUsingDOM(bibliography);

		this.copyDataInclude = [
			{ mime: 'text/plain', data: bibliographyText },
			{ mime: 'text/html', data: bibliography },
		];
		copy(bibliographyText);
	}

	handleCopyHtmlClick = () => {
		const bibliography = this.state.bibliography.join('');
		copy(bibliography);
	}

	handleCopy = ev => {
		if(this.copyDataInclude) {
			this.copyDataInclude.forEach(copyDataFormat => {
				ev.clipboardData.setData(copyDataFormat.mime, copyDataFormat.data);
			});
			ev.preventDefault();
			delete this.copyDataInclude;
		}
	}

	render() {
		const { citationStyle } = this.state;

		return <BibliographyModal
			onCancel={ this.handleCancel }
			onStyleChange={ this.handleStyleChange }
			onLocaleChange={ this.handleLocaleChange }
			citationStyle={ citationStyle }
			citationStyles={ coreCitationStyles }
			onCopyToClipboardClick={ this.handleCopyToClipboardClick }
			onCopyHtmlClick={ this.handleCopyHtmlClick }
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


module.exports = withSelectMode(withDevice(
	connect(mapStateToProps)(BibliographyModalContainer)
));

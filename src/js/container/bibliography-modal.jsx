'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { connect } from 'react-redux';
import { toggleModal, bibliographyItems, preferenceChange } from '../actions';
import { coreCitationStyles } from '../../../data/citation-styles-data.json';
import BibliographyModal from '../component/modal/bibliography';
import { BIBLIOGRAPHY, STYLE_INSTALLER } from '../constants/modals';
import { stripTagsUsingDOM } from '../common/format';
import withDevice from '../enhancers/with-device';
import withSelectMode from '../enhancers/with-select-mode';


class BibliographyModalContainer extends React.PureComponent {
	state = {
		isUpdating: false
	}

	componentDidMount() {
		document.addEventListener('copy', this.handleCopy);
	}

	componentWillUnmount() {
		document.removeEventListener('copy', this.handleCopy);
	}

	async componentDidUpdate({ isOpen: wasOpen,
		citationStyle: prevCitationStyle, citationLocale: prevCitationLocale }) {
		const { bibliographyItems, isOpen, itemKeys, citationStyle, citationLocale } = this.props;

		if((isOpen && !wasOpen) || citationStyle !== prevCitationStyle ||
			citationLocale !== prevCitationLocale) {
			this.setState({ isUpdating: true });
			try {
				const bibliography = await bibliographyItems(itemKeys, citationStyle, citationLocale);
				this.setState({ bibliography });
			} finally {
				this.setState({ isUpdating: false });
			}
		}
	}

	handleCopyToClipboardClick = () => {
		const { bibliography } = this.state;
		const bibliographyText = stripTagsUsingDOM(bibliography);

		this.copyDataInclude = [
			{ mime: 'text/plain', data: bibliographyText },
			{ mime: 'text/html', data: bibliography },
		];
		copy(bibliographyText);
	}

	handleCopyHtmlClick = () => {
		copy(this.state.bibliography);
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
		const { citationLocale, citationStyle, installedCitationStyles } = this.props;
		return <BibliographyModal
			onCancel={ this.handleCancel }
			onStyleChange={ this.handleStyleChange }
			onLocaleChange={ this.handleLocaleChange }
			citationStyle={ citationStyle }
			citationLocale={ citationLocale }
			citationStyles={ [...coreCitationStyles, ...installedCitationStyles] }
			onCopyToClipboardClick={ this.handleCopyToClipboardClick }
			onCopyHtmlClick={ this.handleCopyHtmlClick }
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
	static defaultProps = {
		installedCitationStyles: []
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === BIBLIOGRAPHY;
	const { itemKeys } = state.current;
	const { installedCitationStyles, citationStyle,
		citationLocale } = state.preferences || {};

	return { citationStyle, citationLocale, isOpen, itemKeys,
		installedCitationStyles };
};


export default withSelectMode(withDevice(
	connect(
		mapStateToProps, { bibliographyItems, preferenceChange, toggleModal }
	)(BibliographyModalContainer)
));

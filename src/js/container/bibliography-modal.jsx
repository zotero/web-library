'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { connect } from 'react-redux';
import { toggleModal, bibliographyItems } from '../actions';
import { coreCitationStyles } from '../../../data/citation-styles-data.json';
import BibliographyModal from '../component/modal/bibliography';
import { BIBLIOGRAPHY, STYLE_INSTALLER } from '../constants/modals';
import { stripTagsUsingDOM } from '../common/format';
import withDevice from '../enhancers/with-device';
import withSelectMode from '../enhancers/with-select-mode';


class BibliographyModalContainer extends React.PureComponent {
	state = {
		//@TODO: use state.preferences.citationStyle
		citationStyle: coreCitationStyles.find(cs => cs.isDefault).name,
		locale: 'en-US',
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

	handleStyleChange = async citationStyle => {
		const { dispatch } = this.props;
		if(citationStyle === 'install') {
			await dispatch(toggleModal(BIBLIOGRAPHY, false));
			await dispatch(toggleModal(STYLE_INSTALLER, true));
		} else {
			//@TODO: use state.preference
			this.setState({ citationStyle });
		}
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


export default withSelectMode(withDevice(
	connect(mapStateToProps)(BibliographyModalContainer)
));

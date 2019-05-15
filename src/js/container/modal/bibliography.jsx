'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { connect } from 'react-redux';

import BibliographyModal from '../../component/modal/bibliography';
import withDevice from '../../enhancers/with-device';
import withSelectMode from '../../enhancers/with-select-mode';
import { BIBLIOGRAPHY } from '../../constants/modals';
import { coreCitationStyles } from '../../../../data/citation-styles-data.json';
import { stripTagsUsingDOM } from '../../common/format';
import { toggleModal, bibliographyFromCollection, bibliographyFromItems,
	preferenceChange } from '../../actions';


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

	async componentDidUpdate({
		isOpen: wasOpen,
		citationStyle: prevCitationStyle,
		citationLocale: prevCitationLocale
	}) {
		const { collectionKey, bibliographyFromCollection, bibliographyFromItems,
			isOpen, itemKeys, libraryKey, citationStyle,
			citationLocale } = this.props;

		if((isOpen && !wasOpen) || citationStyle !== prevCitationStyle ||
			citationLocale !== prevCitationLocale) {
			this.setState({ isUpdating: true });
			try {
				var bibliography;
				if(collectionKey) {
					bibliography = await bibliographyFromCollection(
						collectionKey, libraryKey, citationStyle, citationLocale
					);
				} else {
					bibliography = await bibliographyFromItems(
						itemKeys, libraryKey, citationStyle, citationLocale
					);
				}
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

	static propTypes = {
		bibliographyFromCollection: PropTypes.func.isRequired,
		bibliographyFromItems: PropTypes.func.isRequired,
		citationLocale: PropTypes.string,
		citationStyle: PropTypes.string,
		collectionKey: PropTypes.string,
		installedCitationStyles: PropTypes.array,
		isOpen: PropTypes.bool,
		itemKeys: PropTypes.array,
		libraryKey: PropTypes.string,
	}
	static defaultProps = {
		installedCitationStyles: []
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === BIBLIOGRAPHY;
	const { collectionKey, itemKeys, libraryKey } = state.modal;
	const { installedCitationStyles, citationStyle,
		citationLocale } = state.preferences || {};

	return { citationStyle, citationLocale, collectionKey, libraryKey,
		isOpen, itemKeys, installedCitationStyles };
};


export default withSelectMode(withDevice(
	connect(mapStateToProps, { bibliographyFromCollection,
		bibliographyFromItems, preferenceChange, toggleModal }
	)(BibliographyModalContainer)
));

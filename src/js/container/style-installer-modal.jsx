'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toggleModal, fetchStyles, preferenceChange } from '../actions';
import StyleInstallerModal from '../component/modal/style-installer';
import { STYLE_INSTALLER } from '../constants/modals';
import withDevice from '../enhancers/with-device';


class StyleInstallerModalContainer extends React.PureComponent {
	render() {
		return <StyleInstallerModal
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === STYLE_INSTALLER;
	const { installedCitationStyles } = state.preferences || [];
	const { isFetching, stylesData, citationStyle: currentCitationStyle } = state.styles;

	return { currentCitationStyle, installedCitationStyles, isOpen, isFetching,
		stylesData };
};


export default withDevice(
	connect(
		mapStateToProps, { toggleModal, fetchStyles, preferenceChange }
	)(StyleInstallerModalContainer)
);

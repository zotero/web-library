'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import StyleInstallerModal from '../../component/modal/style-installer';
import withDevice from '../../enhancers/with-device';
import { STYLE_INSTALLER } from '../../constants/modals';
import { toggleModal, fetchStyles, preferenceChange } from '../../actions';


class StyleInstallerModalContainer extends React.PureComponent {
	render() {
		return <StyleInstallerModal { ...this.props } />;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === STYLE_INSTALLER;
	const { citationStyle: currentCitationStyle,
		installedCitationStyles } = state.preferences || [];
	const { isFetching, stylesData } = state.styles;

	return { currentCitationStyle, installedCitationStyles, isOpen, isFetching,
		stylesData };
};


export default withDevice(
	connect(
		mapStateToProps, { toggleModal, fetchStyles, preferenceChange }
	)(StyleInstallerModalContainer)
);

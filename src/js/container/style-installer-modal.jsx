'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const { connect } = require('react-redux');
const { toggleModal, fetchStyles } = require('../actions');
const { coreCitationStyles } = require('../../../data/citation-styles-data.json');
const StyleInstallerModal = require('../component/modal/style-installer');
const { STYLE_INSTALLER } = require('../constants/modals');
const withDevice = require('../enhancers/with-device');


class StyleInstallerModalContainer extends React.PureComponent {
	render() {
		return <StyleInstallerModal
			installedCitationStyles = { coreCitationStyles }
			{ ...this.props }
			{ ...this.state }
		/>;
	}

	static propTypes = {}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === STYLE_INSTALLER;
	const { isFetching, stylesData, citationStyle: currentCitationStyle } = state.styles;

	return { currentCitationStyle, isOpen, isFetching, stylesData };
};


module.exports = withDevice(
	connect(mapStateToProps, { toggleModal, fetchStyles })(StyleInstallerModalContainer)
);

'use strict';

import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SyncIndicator from '../component/ui/sync-indicator';

class SyncIndicatorContainer extends React.PureComponent {
	render() {
		return <SyncIndicator { ...this.props } />
	}
}

const mapStateToProps = state => {
	const { libraryKey } = state.current;
	const { version, isSynced, requestsPending } = libraryKey ? state.libraries[libraryKey].sync : {};
	return { version, isSynced, requestsPending };
};

export default connect(mapStateToProps, { })(SyncIndicatorContainer);

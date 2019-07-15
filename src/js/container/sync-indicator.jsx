'use strict';

import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { resetLibrary } from '../actions';
import SyncIndicator from '../component/ui/sync-indicator';
import { get } from '../utils';

class SyncIndicatorContainer extends React.PureComponent {
	render() {
		return <SyncIndicator { ...this.props } />
	}
}

const mapStateToProps = state => {
	const { libraryKey } = state.current;
	const { version, isSynced, requestsPending } = get(state, ['libraries', libraryKey, 'sync'], {});
	return { libraryKey, version, isSynced, requestsPending };
};

export default connect(mapStateToProps, { resetLibrary })(SyncIndicatorContainer);

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Spinner from './spinner';

class SyncIndicator extends React.PureComponent {
	render() {
		const { version, isSynced, requestsPending, tabIndex } = this.props;
		if(requestsPending > 0) {
			return <Spinner tabIndex={ tabIndex } className="small" />;
		}
		return (
			<div tabIndex={ tabIndex }>
				{ isSynced ? '✓' : '❌' }
			</div>
		)
	}
}

export default SyncIndicator;

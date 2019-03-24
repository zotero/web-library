'use strict';

import React from 'react';
import cx from 'classnames';

class Spinner extends React.PureComponent {
	render() {
		return (
			<svg className={ cx('icon', 'icon-spin', this.props.className) } width="16" height="16" viewBox="0 0 16 16">
				<path strokeWidth="1" stroke="currentColor" fill="none" d="M8,15c-3.866,0-7-3.134-7-7s3.134-7,7-7s7,3.134,7,7"/>
			</svg>
		);
	}
}

export default Spinner;

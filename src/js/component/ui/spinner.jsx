import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Spinner = ({ className }) => (
	<svg className={ cx('icon', 'icon-spin', className) } width="16" height="16" viewBox="0 0 16 16">
		<path strokeWidth="1" stroke="currentColor" fill="none" d="M8,15c-3.866,0-7-3.134-7-7s3.134-7,7-7s7,3.134,7,7"/>
	</svg>
);

Spinner.propTypes = {
	className: PropTypes.string,
}

export default memo(Spinner);

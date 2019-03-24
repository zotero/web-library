'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Toolbar = ({ children, className }) => (
	<div className={cx('toolbar', className)}>
		{ children }
	</div>
);

Toolbar.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string
};

const ToolGroup = ({ children }) => (
	<div className="tool-group">
		{ children }
	</div>
);

ToolGroup.propTypes = {
	children: PropTypes.node
};


export {
	Toolbar,
	ToolGroup
};

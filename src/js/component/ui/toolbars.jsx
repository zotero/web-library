'use strict';

import React from 'react';
import cx from 'classnames';

const Toolbar = ({ children, className }) => (
	<div className={cx('toolbar', className)}>
		{ children }
	</div>
);

Toolbar.propTypes = {
	children: React.PropTypes.node,
	className: React.PropTypes.string
};

const ToolGroup = ({ children }) => (
	<div className="tool-group">
		{ children }
	</div>
);

ToolGroup.propTypes = {
	children: React.PropTypes.node
};


module.exports = {
	Toolbar,
	ToolGroup
};
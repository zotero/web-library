'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Toolbar = React.forwardRef(({ children, className, tabIndex, onFocus, onBlur }, ref) => (
	<div
		className={cx('toolbar', className)}
		onBlur={ onBlur }
		onFocus={ onFocus }
		ref={ ref }
		role="toolbar"
		tabIndex={ tabIndex }
	>
		{ children }
	</div>
));

Toolbar.displayName = "Toolbar";

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

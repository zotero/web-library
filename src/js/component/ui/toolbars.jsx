'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

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


module.exports = {
	Toolbar,
	ToolGroup
};
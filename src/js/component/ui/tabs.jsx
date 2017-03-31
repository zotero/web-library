'use strict';

import React from 'react';
import cx from 'classnames';


const Tab = ({ children, isActive, isDisabled, onActivate }) => (
	<li
		className={ cx({ 
			tab: true,
			active: isActive, 
			disabled: isDisabled 
		}) }
		onClick={ isDisabled ? null : onActivate }>
			<a href="" onClick={ ev => { ev.preventDefault(); isDisabled ? null : onActivate(); } }>
				{ children }
			</a>
	</li>
);

Tab.propTypes = {
	children: React.PropTypes.node,
	isActive: React.PropTypes.bool,
	isDisabled: React.PropTypes.bool,
	onActivate: React.PropTypes.func.isRequired
};


const Tabs = ({ children, justified, compact }) => (
	<nav>
		<ul className={ cx('nav', 'tabs', { justified, compact }) }>
			{ children }
		</ul>
	</nav>
);

Tabs.propTypes = {
	children: React.PropTypes.node,
	className: React.PropTypes.string,
	compact: React.PropTypes.bool,
	justified: React.PropTypes.bool
};


module.exports = {
	Tab,
	Tabs
};
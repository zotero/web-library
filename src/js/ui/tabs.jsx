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


const Tabs = ({ children, justified }) => (
	<nav>
		<ul className={ cx({ nav: true, tabs: true, justified }) }>
			{ children }
		</ul>
	</nav>
);

Tabs.propTypes = {
	justified: React.PropTypes.bool,
	children: React.PropTypes.node
};


module.exports = {
	Tab,
	Tabs
};
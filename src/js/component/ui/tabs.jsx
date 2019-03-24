'use strict';

import React from 'react';
import PropTypes from 'prop-types';
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
	children: PropTypes.node,
	isActive: PropTypes.bool,
	isDisabled: PropTypes.bool,
	onActivate: PropTypes.func.isRequired
};


const Tabs = ({ children, justified, compact }) => (
	<nav>
		<ul className={ cx('nav', 'tabs', { justified, compact }) }>
			{ children }
		</ul>
	</nav>
);

Tabs.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	compact: PropTypes.bool,
	justified: PropTypes.bool
};


export {
	Tab,
	Tabs
};

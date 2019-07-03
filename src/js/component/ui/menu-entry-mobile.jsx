'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { NavItem, NavLink } from 'reactstrap/lib';


export default class MobileMenuEntry extends React.PureComponent {
	render() {
		const { label, href, separated, onKeyDown } = this.props;
		return (
			<NavItem>
				<NavLink
					href={ href }
					className={ cx({ separated }) }
					onKeyDown={ onKeyDown }
					tabIndex={ -2 }>
						{ label }
					</NavLink>
			</NavItem>
		);
	}

	static propTypes = {
		label: PropTypes.string,
		href: PropTypes.string,
		onKeyDown: PropTypes.func,
		dropdown: PropTypes.bool,
		entries: PropTypes.array,
		separated: PropTypes.bool,
	}

}

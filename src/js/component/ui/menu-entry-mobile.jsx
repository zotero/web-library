'use strict';

import PropTypes from 'prop-types';
import React from 'react';

import { default as NavItem } from 'reactstrap/lib/NavItem';
import { default as NavLink } from 'reactstrap/lib/NavLink';

import { pick } from '../../common/immutable';

export default class MobileMenuEntry extends React.PureComponent {
	render() {
		const { label } = this.props;

		return (
			<NavItem>
				<NavLink
					{ ...pick(this.props, ['className', 'href', 'onKeyDown']) }
					tabIndex={ -2 }
				>
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

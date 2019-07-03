'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { NavItem, NavLink, UncontrolledDropdown, DropdownToggle,
	DropdownMenu, DropdownItem } from 'reactstrap/lib';
import Icon from './icon';
import { pick } from '../../common/immutable'

class MenuEntry extends React.PureComponent {
	render() {
		const { label, onKeyDown, dropdown, entries, active } = this.props;

		return dropdown ? (
			<NavItem active={active}>
				<UncontrolledDropdown className="dropdown dropdown-wrapper">
					<DropdownToggle
						tag="a"
						href="#"
						className="dropdown-toggle nav-link"
						onKeyDown={ onKeyDown }
						tabIndex={ -2 }
					>
						{ label }
						<Icon type="16/chevron-9" width="16" height="16" />
					</DropdownToggle>
					<DropdownMenu>
						{ entries.map((entry, ind) => (
							entry.separator ?
								<DropdownItem key={ `divider-${ind}` } divider /> :
								<DropdownItem key={ entry.href } href={ entry.href }>
									{ entry.label }
								</DropdownItem>
						))}
					</DropdownMenu>
				</UncontrolledDropdown>
			</NavItem>
		) : (
			<NavItem active={ active }>
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
		active: PropTypes.bool,
	}

	static defaultProps = {
		active: false
	}
}

export default MenuEntry;

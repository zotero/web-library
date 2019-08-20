'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { NavItem, NavLink, UncontrolledDropdown, DropdownToggle,
	DropdownMenu, DropdownItem } from 'reactstrap/lib';
import Icon from './icon';
import { pick } from '../../common/immutable'

class MenuEntry extends React.PureComponent {
	render() {
		const { label, onKeyDown, dropdown, entries, active, position } = this.props;
		const ContainerTag = position === 'right' ? React.Fragment : NavItem;
		const containerProps = position === 'right' ? {} : { active };

		return dropdown ? (
			<ContainerTag { ...containerProps }>
				<UncontrolledDropdown className="dropdown">
					<DropdownToggle
						className="dropdown-toggle nav-link btn-link"
						onKeyDown={ onKeyDown }
						tabIndex={ -2 }
						color={ null }
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
			</ContainerTag>
		) : (
			<ContainerTag { ...containerProps }>
				<NavLink
					{ ...pick(this.props, ['className', 'href', 'onKeyDown']) }
					{ ...pick(this.props, k => k.startsWith('aria-')) }
					tabIndex={ -2 }
				>
					{ label }
				</NavLink>
			</ContainerTag>
		);
	}

	static propTypes = {
		active: PropTypes.bool,
		dropdown: PropTypes.bool,
		entries: PropTypes.array,
		href: PropTypes.string,
		label: PropTypes.string,
		onKeyDown: PropTypes.func,
		position: PropTypes.oneOf(["left", "right"]),
	}

	static defaultProps = {
		active: false
	}
}

export default MenuEntry;

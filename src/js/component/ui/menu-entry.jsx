'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { default as NavItem } from 'reactstrap/lib/NavItem';
import { default as NavLink } from 'reactstrap/lib/NavLink';
import { default as UncontrolledDropdown } from 'reactstrap/lib/UncontrolledDropdown';
import { default as DropdownToggle } from 'reactstrap/lib/DropdownToggle';
import { default as DropdownMenu } from 'reactstrap/lib/DropdownMenu';
import { default as DropdownItem } from 'reactstrap/lib/DropdownItem';

import Icon from './icon';
import { pick } from '../../common/immutable'

class MenuEntry extends React.PureComponent {
	render() {
		const { label, onKeyDown, dropdown, entries, active, position, truncate } = this.props;
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
						{ truncate ? <span className="truncate">{ label }</span> : label }
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
					{ truncate ? <span className="truncate">{ label }</span> : label }
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
		truncate: PropTypes.bool,
	}

	static defaultProps = {
		active: false
	}
}

export default MenuEntry;

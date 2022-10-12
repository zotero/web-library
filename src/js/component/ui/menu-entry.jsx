import React, { memo } from 'react';
import PropTypes from 'prop-types';
import NavItem from 'reactstrap/es/NavItem';
import NavLink from 'reactstrap/es/NavLink';
import UncontrolledDropdown from 'reactstrap/es/UncontrolledDropdown';
import DropdownToggle from 'reactstrap/es/DropdownToggle';
import DropdownMenu from 'reactstrap/es/DropdownMenu';
import DropdownItem from 'reactstrap/es/DropdownItem';

import Icon from './icon';
import { pick } from '../../common/immutable'

const MenuEntry = props => {
	const { label, onKeyDown, dropdown, entries, active, position, truncate } = props;
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
				{ ...pick(props, ['className', 'href', 'onKeyDown']) }
				{ ...pick(props, k => k.startsWith('aria-')) }
				tabIndex={ -2 }
			>
				{ truncate ? <span className="truncate">{ label }</span> : label }
			</NavLink>
		</ContainerTag>
	);
}

MenuEntry.propTypes = {
	active: PropTypes.bool,
	dropdown: PropTypes.bool,
	entries: PropTypes.array,
	href: PropTypes.string,
	label: PropTypes.string,
	onKeyDown: PropTypes.func,
	position: PropTypes.oneOf(["left", "right"]),
	truncate: PropTypes.bool,
}

export default memo(MenuEntry);

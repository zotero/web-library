import React, { memo } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from './dropdown';

import Icon from './icon';
import { pick } from '../../common/immutable'

const MenuEntry = props => {
	const { label, onKeyDown, dropdown, entries, active, position, truncate } = props;
	const ContainerTag = position === 'right' ? React.Fragment : 'li';
	const tagProps = position === 'right' ? {} : { className: cx('nav-item', { active }) };

	return dropdown ? (
		<ContainerTag { ...tagProps }>
			<UncontrolledDropdown>
				<DropdownToggle
					className="dropdown-toggle nav-link btn-link"
					onKeyDown={ onKeyDown }
					tabIndex={ -2 }
				>
					{ truncate ? <span className="truncate">{ label }</span> : label }
					<Icon type="16/chevron-9" width="16" height="16" />
				</DropdownToggle>
				<DropdownMenu>
					{ entries.map((entry, ind) => (
						entry.separator ?
							<DropdownItem key={ `divider-${ind}` } divider /> :
							<DropdownItem key={ entry.href } href={ entry.href } tag="a">
								{ entry.label }
							</DropdownItem>
					))}
				</DropdownMenu>
			</UncontrolledDropdown>
		</ContainerTag>
	) : (
		<ContainerTag>
			<a className={ cx( props.className, 'nav-link') }
				{ ...pick(props, ['href', 'onKeyDown']) }
				{ ...pick(props, k => k.startsWith('aria-')) }
				tabIndex={ -2 }
			>
				{ truncate ? <span className="truncate">{ label }</span> : label }
			</a>
		</ContainerTag>
	);
}

MenuEntry.propTypes = {
	active: PropTypes.bool,
	className: PropTypes.string,
	dropdown: PropTypes.bool,
	entries: PropTypes.array,
	href: PropTypes.string,
	label: PropTypes.string,
	onKeyDown: PropTypes.func,
	position: PropTypes.oneOf(["left", "right"]),
	truncate: PropTypes.bool,
}

export default memo(MenuEntry);

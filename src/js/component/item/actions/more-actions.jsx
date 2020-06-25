import React, { memo, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Icon from '../../ui/icon';
import { currentGoToSubscribeUrl } from '../../../actions';

const MoreActions = props => {
	const dispatch = useDispatch();
	const { tabIndex, onFocusNext, onFocusPrev } = props;
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}, [onFocusNext, onFocusPrev]);

	const handleSubscribeClick = useCallback(() => {
		dispatch(currentGoToSubscribeUrl());
	}, [dispatch]);

	return (
		<Dropdown
			className="new-item-selector"
			isOpen={ isOpen }
			toggle={ handleToggleDropdown }
		>
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				color={ null }
				onKeyDown={ handleKeyDown }
				tabIndex={ tabIndex }
				title="New Item"
			>
				<Icon type={ '16/options' } width="16" height="16" />
			</DropdownToggle>
			<DropdownMenu>
				<DropdownItem onClick={ handleSubscribeClick }>
					Subscribe to Feed
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>

	);
}

export default memo(MoreActions);

import React, { memo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Icon from '../../ui/icon';
import { currentGoToSubscribeUrl, openBestAttachment } from '../../../actions';
import { cleanDOI, cleanURL, get, getDOIURL } from '../../../utils';


const MoreActionsMenu = () => {
	const dispatch = useDispatch();
	const item = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey]));
	const attachment = get(item, [Symbol.for('links'), 'attachment'], null);
	const isViewFile = attachment !== null;
	const url = item && item.url ? cleanURL(item.url, true) : null;
	const doi = item && item.DOI ? cleanDOI(item.DOI) : null;
	const isViewOnline = !isViewFile && (url || doi);

	const handleViewFileClick = useCallback(() => {
		dispatch(openBestAttachment(item.key));
	}, [dispatch, item]);

	const handleViewOnlineClick = useCallback(() => {
		if(url) {
			window.open(url);
		} else if(doi) {
			window.open(getDOIURL(doi));
		}
	}, [doi, url]);

	const handleSubscribeClick = useCallback(() => {
		dispatch(currentGoToSubscribeUrl());
	}, [dispatch]);

	return (
		<DropdownMenu>
			{ isViewFile && (
				<DropdownItem onClick={ handleViewFileClick }>
					View { attachment.attachmentType === 'application/pdf' ? 'PDF' : 'File' }
				</DropdownItem>
			) }
			{ isViewOnline && (
			<DropdownItem onClick={ handleViewOnlineClick }>
				View Online
			</DropdownItem>
			) }
			<DropdownItem onClick={ handleSubscribeClick }>
				Subscribe to Feed
			</DropdownItem>
		</DropdownMenu>
	);
}

const MoreActionsDropdown = props => {

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
			{
				// For performance reasons MoreActionsMenu is only mounted when "more actions" is
				// open otherwise it would re-render every time item selection is changed adding
				// unnecesary overhead
				isOpen && <MoreActionsMenu />
			}
		</Dropdown>
	);
}

export default memo(MoreActionsDropdown);

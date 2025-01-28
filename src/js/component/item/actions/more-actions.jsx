import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useDispatch, useSelector } from 'react-redux';

import { cleanDOI, cleanURL, get, getDOIURL } from '../../../utils';
import { currentGoToSubscribeUrl, pickBestItemAction } from '../../../actions';
import { useItemActionHandlers } from '../../../hooks';
import { READER_CONTENT_TYPES, READER_CONTENT_TYPES_HUMAN_READABLE } from '../../../constants/reader';

const MoreActionsItems = ({ divider = false }) => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);
	const item = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey]));
	const itemsSource = useSelector(state => state.current.itemsSource);
	const selectedItemsCanBeRecognized = useSelector(state => state.current.itemKeys.every(
		key => state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.itemType === 'attachment'
			&& state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.contentType === 'application/pdf'
	));
	const selectedItemsAreAllAttachments = useSelector(state => state.current.itemKeys.length > 0 && state.current.itemKeys.every(
		key => state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.itemType === 'attachment'
	));
	const selectedItemsCanBeUnrecognized = useSelector(state =>
		state.current.itemKeys.every(
			key => !!state.recognize.lookup[`${state.current.libraryKey}-${key}`]
		));
	const { handleDuplicate, handleRetrieveMetadata, handleUnrecognize, handleCreateParentItem } = useItemActionHandlers();

	const attachment = get(item, [Symbol.for('links'), 'attachment'], null);
	const isViewFile = attachment !== null;
	const url = item && item.url ? cleanURL(item.url, true) : null;
	const doi = item && item.DOI ? cleanDOI(item.DOI) : null;
	const isViewOnline = !isViewFile && (url || doi);
	const canDuplicate = !isReadOnly && item && item.itemType !== 'attachment' && (itemsSource === 'collection' || itemsSource === 'top');

	const handleViewFileClick = useCallback(() => {
		dispatch(pickBestItemAction(item.key));
	}, [dispatch, item]);

	const handleViewOnlineClick = useCallback(() => {
		if (url) {
			window.open(url);
		} else if (doi) {
			window.open(getDOIURL(doi));
		}
	}, [doi, url]);

	return (
		<Fragment>
			{isViewFile && (
				<DropdownItem onClick={handleViewFileClick}>
					View {Object.keys(READER_CONTENT_TYPES).includes(attachment.attachmentType) ? READER_CONTENT_TYPES_HUMAN_READABLE[attachment.attachmentType] : 'File'}
				</DropdownItem>
			)}
			{isViewOnline && (
				<DropdownItem onClick={handleViewOnlineClick}>
					View Online
				</DropdownItem>
			)}
			{(isTouchOrSmall && selectedItemsCanBeRecognized) && (
				<>
					{(canDuplicate || isViewFile || isViewOnline) && <DropdownItem divider />}
					<DropdownItem onClick={handleRetrieveMetadata}>
						Retrieve Metadata
					</DropdownItem>
				</>
			)}
			{ selectedItemsAreAllAttachments && (
				<DropdownItem onClick={handleCreateParentItem}>
					{ item ? "Create Parent Item" : "Create Parent Items" }
				</DropdownItem>
			)}
			{selectedItemsCanBeUnrecognized && (
				<>
					{(canDuplicate || isViewFile || isViewOnline) && <DropdownItem divider />}
					<DropdownItem onClick={handleUnrecognize}>
						Undo Retrieve Metadata
					</DropdownItem>
				</>
			)}
			{canDuplicate && (
				<DropdownItem onClick={handleDuplicate}>
					Duplicate Item
				</DropdownItem>
			)}
			{divider && (isViewFile || isViewOnline || selectedItemsAreAllAttachments || selectedItemsCanBeUnrecognized || canDuplicate) && <DropdownItem divider />}
		</Fragment>
	);
}

const MoreActionsDropdownDesktop = memo(props => {
	const { tabIndex, onFocusNext, onFocusPrev } = props;
	const dispatch = useDispatch();
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	const handleKeyDown = useCallback(ev => {
		if (ev.target !== ev.currentTarget) {
			return;
		}

		if (ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if (ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}, [onFocusNext, onFocusPrev]);

	const handleSubscribeClick = useCallback(() => {
		dispatch(currentGoToSubscribeUrl());
	}, [dispatch]);

	return (
		<Dropdown
			className="new-item-selector"
			isOpen={isOpen}
			onToggle={handleToggleDropdown}
		>
			<DropdownToggle
				className="btn-icon dropdown-toggle"
				onKeyDown={handleKeyDown}
				tabIndex={tabIndex}
				title="More"
			>
				<Icon type={'16/options'} width="16" height="16" />
			</DropdownToggle>
			{
				// For performance reasons MoreActionsMenu is only mounted when "more actions" is
				// open otherwise it would re-render every time item selection is changed adding
				// unnecesary overhead
				isOpen && (
					<DropdownMenu>
						<MoreActionsItems divider />
						<DropdownItem onClick={handleSubscribeClick}>
							Subscribe To Feed
						</DropdownItem>
					</DropdownMenu>
				)
			}
		</Dropdown>
	);
});

MoreActionsItems.propTypes = {
	divider: PropTypes.bool,
};

MoreActionsDropdownDesktop.propTypes = {
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	tabIndex: PropTypes.number,
};

MoreActionsDropdownDesktop.displayName = 'MoreActionsDropdownDesktop';

const MoreActionsDropdownTouch = memo(() => {
	const item = useSelector(state => get(state, ['libraries', state.current.libraryKey, 'items', state.current.itemKey]));
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isReadOnly = useSelector(state => (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly);

	const attachment = get(item, [Symbol.for('links'), 'attachment'], null);
	const isViewFile = attachment !== null;
	const url = item && item.url ? cleanURL(item.url, true) : null;
	const doi = item && item.DOI ? cleanDOI(item.DOI) : null;
	const isViewOnline = !isViewFile && (url || doi);
	const canDuplicate = !isReadOnly && item && item.itemType !== 'attachment' && (itemsSource === 'collection' || itemsSource === 'top');
	const selectedItemsCanBeRecognized = useSelector(state => state.current.itemKeys.length > 0 && state.current.itemKeys.every(
		key => state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.itemType === 'attachment'
			&& state.libraries[state.current.libraryKey]?.dataObjects?.[key]?.contentType === 'application/pdf'
	));
	const selectedItemsCanBeUnrecognized = useSelector(state =>
		state.current.itemKeys.length > 0 && state.current.itemKeys.every(
			key => !!state.recognize.lookup[`${state.current.libraryKey}-${key}`]
		));
	const canRecognize = !isReadOnly && selectedItemsCanBeRecognized;
	const canUnregonize = !isReadOnly && selectedItemsCanBeUnrecognized;
	const hasAnyAction = isViewFile || isViewOnline || canDuplicate || canRecognize || canUnregonize;
	const [isOpen, setIsOpen] = useState(false);

	const handleDropdownToggle = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

	return (
		<Dropdown
			isOpen={isOpen}
			onToggle={handleDropdownToggle}
		>
			<DropdownToggle
				disabled={!hasAnyAction}
				className="btn-link btn-icon dropdown-toggle item-actions-touch"
			>
				<Icon
					type="24/options"
					symbol={isOpen ? 'options-block' : 'options'}
					width="24"
					height="24"
				/>
			</DropdownToggle>
			{hasAnyAction && (<DropdownMenu>
				<MoreActionsItems />
			</DropdownMenu>)}
		</Dropdown>
	)
});

MoreActionsDropdownTouch.displayName = 'MoreActionsDropdownTouch';

export { MoreActionsDropdownDesktop, MoreActionsItems, MoreActionsDropdownTouch };

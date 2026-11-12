import { Fragment, memo, useCallback, useRef, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useDispatch, useSelector } from 'react-redux';

import { getDOIURL } from '../../../utils';
import { currentGoToSubscribeUrl, pickBestItemAction, pickBestAttachmentItemAction } from '../../../actions';
import { useItemActionHandlers, useItemsActions } from '../../../hooks';
import { READER_CONTENT_TYPES, READER_CONTENT_TYPES_HUMAN_READABLE } from '../../../constants/reader';
import { setModalFocusRestore } from '../../../common/modal-focus-restore';

const useMoreActionsGroups = toggleRef => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isRecognizerAvailable = useSelector(state => state.config.isRecognizerAvailable);
	const { handleDuplicate, handleRetrieveMetadata, handleUnrecognize, handleCreateParentItem, handleChangeParentItemModalOpen } = useItemActionHandlers();
	const { attachmentContentType, canDuplicate, canCreateParent, canRecognize, canReparent, canUnregonize, doi, isViewFile,
		isViewOnline, item, selectedCount, url } = useItemsActions();

	const handleViewFileClick = useCallback(() => {
		if (item.itemType === 'attachment') {
			dispatch(pickBestAttachmentItemAction(item.key));
		} else {
			dispatch(pickBestItemAction(item.key));
		}
	}, [dispatch, item]);

	const handleViewOnlineClick = useCallback(() => {
		if (url) {
			window.open(url);
		} else if (doi) {
			window.open(getDOIURL(doi));
		}
	}, [doi, url]);

	const handleCreateParentItemDropdownClick = useCallback(() => {
		if (toggleRef?.current) {
			setModalFocusRestore(toggleRef.current);
		}
		handleCreateParentItem();
	}, [handleCreateParentItem, toggleRef]);

	const handleChangeParentItemDropdownClick = useCallback(() => {
		if (toggleRef?.current) {
			setModalFocusRestore(toggleRef.current);
		}
		handleChangeParentItemModalOpen();
	}, [handleChangeParentItemModalOpen, toggleRef]);

	const fileTypeLabel = Object.keys(READER_CONTENT_TYPES).includes(attachmentContentType) ?
		READER_CONTENT_TYPES_HUMAN_READABLE[attachmentContentType] : 'File';

	// Groups are rendered with dividers between them; empty groups are dropped
	return [
		[
			isViewFile && { key: 'view-file', label: `View ${fileTypeLabel}`, onClick: handleViewFileClick },
			isViewOnline && { key: 'view-online', label: 'View Online', onClick: handleViewOnlineClick },
		],
		[
			canDuplicate && { key: 'duplicate', label: 'Duplicate Item', onClick: handleDuplicate },
		],
		[
			isTouchOrSmall && isRecognizerAvailable && canRecognize && { key: 'retrieve-metadata', label: 'Retrieve Metadata', onClick: handleRetrieveMetadata },
			canCreateParent && { key: 'create-parent', label: selectedCount === 1 ? 'Create Parent Item' : 'Create Parent Items', onClick: handleCreateParentItemDropdownClick },
			canReparent && { key: 'change-parent', label: 'Change Parent Item', onClick: handleChangeParentItemDropdownClick },
			canUnregonize && { key: 'unrecognize', label: 'Undo Retrieve Metadata', onClick: handleUnrecognize },
		],
	].map(group => group.filter(Boolean)).filter(group => group.length > 0);
};

const MoreActionsItems = ({ divider = false, leadingDivider = false, toggleRef }) => {
	const groups = useMoreActionsGroups(toggleRef);

	if (groups.length === 0) {
		return null;
	}

	return (
		<Fragment>
			{leadingDivider && <DropdownItem divider />}
			{groups.map((group, index) => (
				<Fragment key={group[0].key}>
					{index > 0 && <DropdownItem divider />}
					{group.map(({ key, label, onClick }) => (
						<DropdownItem key={key} onClick={onClick}>
							{label}
						</DropdownItem>
					))}
				</Fragment>
			))}
			{divider && <DropdownItem divider />}
		</Fragment>
	);
}

const MoreActionsDropdownDesktop = memo(props => {
	const { tabIndex, onFocusNext, onFocusPrev } = props;
	const dispatch = useDispatch();
	const toggleRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);

	const handleToggleDropdown = useCallback(() => {
		setIsOpen(isOpen => !isOpen);
	}, []);

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
			isOpen={isOpen}
			onToggle={handleToggleDropdown}
			strategy="fixed"
		>
			<DropdownToggle
				ref={toggleRef}
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
						<MoreActionsItems divider toggleRef={toggleRef} />
						<DropdownItem onClick={handleSubscribeClick}>
							Subscribe To Feed
						</DropdownItem>
					</DropdownMenu>
				)
			}
		</Dropdown>
	);
});

MoreActionsDropdownDesktop.displayName = 'MoreActionsDropdownDesktop';

const MoreActionsDropdownTouch = memo(() => {
	const hasAnyAction = useMoreActionsGroups().length > 0;
	const [isOpen, setIsOpen] = useState(false);

	const handleDropdownToggle = useCallback(() => {
		setIsOpen(isOpen => !isOpen);
	}, []);

	return (
		<Dropdown
			isOpen={isOpen}
			onToggle={handleDropdownToggle}
			strategy="fixed"
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

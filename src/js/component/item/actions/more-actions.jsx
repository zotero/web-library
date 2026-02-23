import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useRef, useState } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon } from 'web-common/components';
import { useDispatch, useSelector } from 'react-redux';

import { getDOIURL } from '../../../utils';
import { currentGoToSubscribeUrl, pickBestItemAction, pickBestAttachmentItemAction } from '../../../actions';
import { useItemActionHandlers, useItemsActions } from '../../../hooks';
import { READER_CONTENT_TYPES, READER_CONTENT_TYPES_HUMAN_READABLE } from '../../../constants/reader';
import { setModalFocusRestore } from '../../../common/modal-focus-restore';

const MoreActionsItems = ({ divider = false, toggleRef }) => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { handleDuplicate, handleRetrieveMetadata, handleUnrecognize, handleCreateParentItem, handleChangeParentItemModalOpen } = useItemActionHandlers();
	const { attachmentContentType, canDuplicate, canCreateParent, canRecognize, canReparent, canUnregonize, doi, isViewFile,
		isViewOnline, item, selectedCount, url } = useItemsActions();

	const isRecognizerAvailable = useSelector(state => state.config.isRecognizerAvailable);

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

	return (
		<Fragment>
			{isViewFile && (
				<DropdownItem onClick={handleViewFileClick}>
					View {Object.keys(READER_CONTENT_TYPES).includes(attachmentContentType) ? READER_CONTENT_TYPES_HUMAN_READABLE[attachmentContentType] : 'File'}
				</DropdownItem>
			)}
			{isViewOnline && (
				<DropdownItem onClick={handleViewOnlineClick}>
					View Online
				</DropdownItem>
			)}

			{((isViewFile || isViewOnline)) && (canDuplicate) && <DropdownItem divider />}

			{canDuplicate && (
				<DropdownItem onClick={handleDuplicate}>
					Duplicate Item
				</DropdownItem>
			)}

			{canDuplicate && (canRecognize || canCreateParent || canUnregonize) && <DropdownItem divider />}

			{(isTouchOrSmall && isRecognizerAvailable && canRecognize) && (
				<DropdownItem onClick={handleRetrieveMetadata}>
					Retrieve Metadata
				</DropdownItem>
			)}
			{canCreateParent && (
				<DropdownItem onClick={handleCreateParentItemDropdownClick}>
					{selectedCount === 1 ? "Create Parent Item" : "Create Parent Items"}
				</DropdownItem>
			)}
			{ canReparent && (
				<DropdownItem onClick={handleChangeParentItemDropdownClick}>
					Change Parent Item
				</DropdownItem>
			)}
			{canUnregonize && (
				<DropdownItem onClick={handleUnrecognize}>
					Undo Retrieve Metadata
				</DropdownItem>
			)}
			{divider && (isViewFile || isViewOnline || canDuplicate || (isTouchOrSmall && isRecognizerAvailable && canRecognize) || canCreateParent || canUnregonize) && <DropdownItem divider />}
		</Fragment>
	);
}

const MoreActionsDropdownDesktop = memo(props => {
	const { tabIndex, onFocusNext, onFocusPrev } = props;
	const dispatch = useDispatch();
	const toggleRef = useRef(null);
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

MoreActionsItems.propTypes = {
	divider: PropTypes.bool,
	toggleRef: PropTypes.object,
};

MoreActionsDropdownDesktop.propTypes = {
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	tabIndex: PropTypes.number,
};

MoreActionsDropdownDesktop.displayName = 'MoreActionsDropdownDesktop';

const MoreActionsDropdownTouch = memo(() => {
	const { hasAnyAction } = useItemsActions();
	const [isOpen, setIsOpen] = useState(false);

	const handleDropdownToggle = useCallback(() => {
		setIsOpen(!isOpen);
	}, [isOpen]);

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

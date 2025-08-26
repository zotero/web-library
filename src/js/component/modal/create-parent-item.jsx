import cx from 'classnames';
import { Button, Icon } from 'web-common/components';
import { Fragment, useCallback, memo, useEffect, useState, useRef, useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious, useFocusManager } from 'web-common/hooks';
import { getZotero } from 'web-common/zotero';

import Input from '../form/input';
import Modal from '../ui/modal';
import { CREATE_PARENT_ITEM } from '../../constants/modals';
import {
	createEmptyParentItems, createParentItemFromIdentifier, dismissErrorByTag, navigate,
	reportIdentifierNoResults, toggleModal, triggerSelectMode
} from '../../actions';

const CreateParentItemModal = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const errors = useSelector(state => state.errors);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const itemKey = useSelector(state => state.current.itemKey);
	const itemKeys = useSelector(state => state.current.itemKeys);
	const isOpen = useSelector(state => state.modal.id === CREATE_PARENT_ITEM);
	const wasOpen = usePrevious(isOpen);
	const inputEl = useRef(null);
	const footerRef = useRef(null);
	const id = useId();
	const [isBusy, setIsBusy] = useState(itemKeys.length > 1);
	const [identifier, setIdentifier] = useState('');
	const skipNextFocusRef = useRef(false); // required for modal's scopedTab (focus trap) to work correctly
	const { focusNext, focusPrev, receiveBlur, receiveFocus, resetLastFocused } = useFocusManager(
		footerRef, { initialQuerySelector: '.btn-outline-secondary:not(:disabled)' }
	);

	const addFromIdentifier = useCallback(async (newIdentifier) => {
		const identifiers = getZotero().Utilities.extractIdentifiers(newIdentifier);
		if (identifiers.length === 1) {
			try {
				setIsBusy(true);
				const identifierValue = Object.values(identifiers[0])[0];
				const parentItem = await dispatch(createParentItemFromIdentifier(itemKey, identifierValue, libraryKey));
				if (parentItem) {
					dispatch(triggerSelectMode(false));
					dispatch(navigate({ items: [parentItem.key], noteKey: null, attachmentKey: null, view: 'item-details' }, false));
				}
			} finally {
				dispatch(toggleModal(CREATE_PARENT_ITEM, false));
			}
		} else if (identifiers.length > 1) {
			dispatch(reportIdentifierNoResults('Too many identifiers. Please enter one identifier and try again.'))
		} else {
			dispatch(reportIdentifierNoResults());
		}
	}, [dispatch, itemKey, libraryKey]);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal());
	}, [dispatch]);

	const handleInputChange = useCallback(newIdentifier => {
		if (errors.length > 0) {
			dispatch(dismissErrorByTag('identifier'));
		}
		setIdentifier(newIdentifier);
	}, [dispatch, errors]);

	const handleInputBlur = useCallback(() => {
		return true;
	}, []);

	const handleInputCommit = useCallback((newIdentifier) => {
		addFromIdentifier(newIdentifier)
	}, [addFromIdentifier]);

	const handleAddClick = useCallback(() => {
		addFromIdentifier(identifier);
	}, [addFromIdentifier, identifier]);

	const handleManualEntryClick = useCallback(async () => {
		setIsBusy(true);
		try {
			const parentItems = await dispatch(createEmptyParentItems(itemKeys, libraryKey));
			if (parentItems.length === 1) {
				dispatch(triggerSelectMode(false));
				dispatch(navigate({ items: [parentItems[0].key], noteKey: null, attachmentKey: null, view: 'item-details' }, false));
			}
		} finally {
			dispatch(toggleModal(CREATE_PARENT_ITEM, false));
		}
	}, [dispatch, itemKeys, libraryKey]);

	const handleTriggeredForMultipleItems = useCallback(async () => {
		try {
			const newItems = await dispatch(createEmptyParentItems(itemKeys, libraryKey));
			if (newItems.length > 0) {
				dispatch(triggerSelectMode(true));
				dispatch(navigate({ items: newItems.map(i => i.key), noteKey: null, attachmentKey: null, view: 'item-list' }, false));
			}
		} finally {
			dispatch(toggleModal(CREATE_PARENT_ITEM, false));
		}
	}, [dispatch, itemKeys, libraryKey]);

	const handleFocus = useCallback((ev) => {
		if (skipNextFocusRef.current) {
			skipNextFocusRef.current = false;
		} else {
			receiveFocus(ev);
		}
	}, [receiveFocus]);

	const handleBlur = useCallback((ev) => {
		// Forget the last focused element every time the footer loses focus
		// This means that, once at least one item is selected, after tabbing to the footer focus goes to the "Add Selected" button
		receiveBlur(ev);
		resetLastFocused();
	}, [receiveBlur, resetLastFocused])

	const handleFooterKeyDown = useCallback((ev) => {
		if (ev.key === 'ArrowRight') {
			focusNext(ev, { useCurrentTarget: false });
		} else if (ev.key === 'ArrowLeft') {
			focusPrev(ev, { useCurrentTarget: false });
		} else if (ev.key === 'Tab' && !ev.shiftKey) {
			// for the modal's focus trap to work correctly, we need to make sure the focus is moved to the footerRef
			// (scopedTab in react-modal needs focus to be on the last "tabbable" so that it can trap the focus)
			skipNextFocusRef.current = true;
			footerRef.current.focus();
			footerRef.current.tabIndex = 0;
			footerRef.current.dataset.focusRoot = '';
		}
	}, [focusNext, focusPrev]);

	const handleModalAfterOpen = useCallback(() => {
		// on touch, wait for the animation to finish before focusing the input
		setTimeout(() => { inputEl.current?.focus(); }, isTouchOrSmall ? 200 : 0);
	}, [isTouchOrSmall]);

	useEffect(() => {
		if (isOpen && !wasOpen) {
			if (itemKeys.length > 1) {
				handleTriggeredForMultipleItems();
			} else {
				setIsBusy(false);
			}
		}
	}, [handleTriggeredForMultipleItems, isOpen, itemKeys.length, wasOpen]);

	return (
		<Modal
			className={"create-parent-item-modal"}
			contentLabel="Create Parent Item"
			isOpen={isOpen}
			isBusy={isBusy}
			onRequestClose={handleCancel}
			onAfterOpen={handleModalAfterOpen}
			overlayClassName={cx('modal-centered', { 'modal-slide': isTouchOrSmall })}
		>
			<div className="modal-header">
				{
					isTouchOrSmall ? (
						<Fragment>
							<div className="modal-header-left">
								<Button
									className="btn-link"
									onClick={handleCancel}
								>
									Cancel
								</Button>
							</div>
							<div className="modal-header-right">
								<Button
									disabled={identifier === ''}
									className="btn-link"
									onClick={handleAddClick}
								>
									Create Parent Item
								</Button>
							</div>
						</Fragment>
					) : (
						<Fragment>
							<h4 className="modal-title truncate">
								Create Parent Item
							</h4>
							<Button
								icon
								className="close"
								onClick={handleCancel}
								title="Close Dialog"
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</Fragment>
					)
				}
			</div>
			<div
				className="modal-body"
			>
				<h3>
					<label htmlFor={`${id}-input`}>
						Enter a DOI, ISBN, PMID, arXiv ID, or ADS Bibcode to identify this file:
					</label>
				</h3>
				<div className="form">
					<div className="form-group">
						<Input
							autocomplete="off"
							id={`${id}-input`}
							onBlur={handleInputBlur}
							onChange={handleInputChange}
							onCommit={handleInputCommit}
							ref={inputEl}
							tabIndex={0}
							value={identifier}
						/>
					</div>
				</div>
			</div>
			<div
				className="modal-footer"
				ref={footerRef}
				onFocus={handleFocus}
				onBlur={handleBlur}
				onKeyDown={handleFooterKeyDown}
				tabIndex={0}
			>
				<div className="modal-footer-left">
					<Button className="btn btn-link" onClick={handleManualEntryClick} tabIndex={-2}>
						Manual Entry
					</Button>
				</div>
				{!isTouchOrSmall && (
					<div className="modal-footer-right">
						<Button
							disabled={identifier === ''}
							className="btn btn-link"
							onClick={handleAddClick}
							tabIndex={-2}
						>
							Create Parent Item
						</Button>
					</div>
				)}
			</div>
		</Modal>
	);
}

export default memo(CreateParentItemModal);

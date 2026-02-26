import { Button, Icon } from 'web-common/components';
import { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import { pick } from 'web-common/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { CHANGE_PARENT_ITEM } from '../../constants/modals';
import { toggleModal, querySecondary, chunkedChangeParentItem } from '../../actions';
import { PICKS_SINGLE_ITEM } from '../../constants/picker-modes';
import { useNavigationState } from '../../hooks';
import ItemsList from '../item/items/list';
import ItemsTable from '../item/items/table';
import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import Search from '../search';
import TouchHeader from '../touch-header.jsx';
import SearchBar from '../touch-header/searchbar';
import { isEPUBAttachment, isPDFAttachment, isRegularItem, isWebAttachment } from '../../common/item.js';
import { pluralize } from '../../common/format.js';
import FocusTrap from '../focus-trap';

const ChangeParentItemModal = () => {
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const affectedItemKeys = useSelector(state => state.modal.keys ?? state.current.itemKeys);
	const isOpen = useSelector(state => state.modal.id === CHANGE_PARENT_ITEM);
	const isItemsReady = useSelector(state => state.current.itemKeys
		.every(key => state.libraries[state.current.libraryKey]?.dataObjects?.[key])
	);
	const canBeMovedOutOfParent = useSelector(state => !affectedItemKeys.some(key => {
		const item = state.libraries[libraryKey].items[key];
		if(!item.parentItem) {
			// Prevent moving out if at least one item does not have a parent
			return true;
		}
		// Prevent moving out if any item is a web attachment that is neither a PDF nor an EPUB
		// https://github.com/zotero/zotero/blob/8041d7d4df89d7c174f9aae1b371cc0d20823872/chrome/content/zotero/zoteroPane.js#L5258
		return isWebAttachment(item) && !isPDFAttachment(item) && !isEPUBAttachment(item);
	}));
	const allNotes = useSelector(state => affectedItemKeys.every(key => state.libraries[libraryKey].items[key].itemType === 'note'));
	const allAttachments = useSelector(state => affectedItemKeys.every(key => state.libraries[libraryKey].items[key].itemType === 'attachment'));
	const columnsKey = 'changeParentItemColumns';
	const wasItemsReady = usePrevious(isItemsReady);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { navState, touchHeaderPath, handleNavigation, resetNavState } = useNavigationState(PICKS_SINGLE_ITEM, { libraryKey, collectionKey, view: 'item-list' });
	const isValidTarget = useSelector(state => navState.itemKeys.length > 0 && isRegularItem(
		state.libraries[navState.libraryKey]?.dataObjects?.[navState.itemKeys[0]])
	);
	const [isBusy, setIsBusy] = useState(!isItemsReady);
	const [isSearchMode, setIsSearchMode] = useState(false); // on mobile need to toggle search mode on/off
	const wasOpen = usePrevious(isOpen);
	const searchRef = useRef(null);
	const rightRef = useRef(null);
	const footerRef = useRef(null);
	const beforeSearchView = useRef(null);
	const prevNavState = usePrevious(navState);
	const { receiveFocus, receiveBlur, focusNext, focusPrev } = useFocusManager(rightRef, { initialQuerySelector: 'input[type="search"]' });
	const { receiveFocus: receiveFooterFocus, receiveBlur: receiveFooterBlur,
		focusNext: focusFooterNext, focusPrev: focusFooterPrev } = useFocusManager(footerRef, { initialQuerySelector: '.modal-footer-right button' });
	const unparentLabel = `Convert to Standalone ${(!isTouchOrSmall && allNotes) ?
		pluralize('Note', affectedItemKeys.length) : (!isTouchOrSmall && allAttachments) ?
		pluralize('Attachment', affectedItemKeys.length) : '' }`;

	const sharedProps = {
		columnsKey,
		...pick(navState, ['libraryKey', 'collectionKey', 'view', 'q', 'qmode']),
		itemsSource: 'secondary',
		selectedItemKeys: navState.itemKeys || [], // or itemKeys?
		pickerMode: PICKS_SINGLE_ITEM,
		pickerNavigate: handleNavigation
	};

	const changeParentItem = useCallback(async (newParentItem) => {
		setIsBusy(true);
		await dispatch(chunkedChangeParentItem(affectedItemKeys, newParentItem))
		setIsBusy(false);
		dispatch(toggleModal(null, false));
	}, [affectedItemKeys, dispatch]);

	const handleSelectItems = useCallback(async () => {
		await changeParentItem(navState.itemKeys[0])
	}, [changeParentItem, navState.itemKeys]);

	const handleUnparent = useCallback(async () => {
		await changeParentItem(false)
	}, [changeParentItem]);

	const handleSearch = useCallback((searchNavObject) => {
		handleNavigation({
			library: navState.libraryKey,
			collection: navState.collectionKey,
			view: 'item-list',
			...pick(searchNavObject, ['search', 'qmode']) // keys other than 'search' and 'qmode' from `onSearch` are only irrelevant here and can actually break the navState
		});
	}, [handleNavigation, navState]);

	const handleCancel = useCallback(() => {
		dispatch(toggleModal(null, false));
	}, [dispatch]);

	const handleAfterOpen = useCallback(() => {
		// Use setTimeout to ensure focus is set after any dropdown close handler
		// that may also use setTimeout to restore focus to its trigger button.
		// On touch, wait for the slide animation to finish before focusing
		setTimeout(() => {
			searchRef.current?.focus();
		}, isTouchOrSmall ? 200 : 0);
	}, [isTouchOrSmall]);

	const handleHeaderKeyDown = useCallback(ev => {
		if (ev.target !== ev.currentTarget) return;
		if (ev.key === 'ArrowRight') {
			focusNext(ev);
		} else if (ev.key === 'ArrowLeft') {
			focusPrev(ev);
		}
	}, [focusNext, focusPrev]);

	const handleFooterKeyDown = useCallback(ev => {
		if (ev.target !== ev.currentTarget) return;
		if (ev.key === 'ArrowRight') {
			focusFooterNext(ev);
		} else if (ev.key === 'ArrowLeft') {
			focusFooterPrev(ev);
		}
	}, [focusFooterNext, focusFooterPrev]);

	const handleSearchModeToggle = useCallback(() => {
		if(isSearchMode) {
			// cancel search and reset the navigation state to the current library and collection
			handleNavigation({
				library: navState.libraryKey,
				collection: navState.collectionKey,
				view: beforeSearchView.current,
			});
			beforeSearchView.current = null;
		} else {
			beforeSearchView.current = navState.view;
		}
		setIsSearchMode(!isSearchMode);
	}, [handleNavigation, isSearchMode, navState]);

	useEffect(() => {
		if (!wasItemsReady && isItemsReady) {
			setIsBusy(false);
		}
	}, [wasItemsReady, isItemsReady]);

	useEffect(() => {
		if (wasOpen && !isOpen) {
			// Reset the navigation state to the current library and collection. This ensures
			// consistency if the modal is closed and reopened quickly (before the modal manager
			// unmounts it).
			handleNavigation({ library: libraryKey, collection: collectionKey, view: 'item-list' });
		}
	}, [resetNavState, isOpen, handleNavigation, libraryKey, wasOpen, collectionKey]);

	useEffect(() => {
		const { libraryKey, collectionKey = null, isTrash = false, isMyPublications = false, q = null, qmode = null, tags = [] } = navState;
		if(isOpen) {
			dispatch(querySecondary({ libraryKey, collectionKey, isTrash, isMyPublications, q, qmode, tag: tags }));
		}
	}, [dispatch, isOpen, navState]);

	useEffect(() => {
		if(navState.libraryKey !== prevNavState?.libraryKey || navState.collectionKey !== prevNavState?.collectionKey) {
			searchRef.current?.reset();
		}
	}, [navState, prevNavState]);

	return (
		<Modal
			className="modal-touch modal-item-picker change-parent-item-modal"
			contentLabel="Change Parent Item"
			isBusy={isBusy}
			isOpen={isOpen}
			onAfterOpen={handleAfterOpen}
			onRequestClose={handleCancel}
			overlayClassName="modal-slide modal-full-height modal-centered modal-contains-picker"
		>
			<FocusTrap>
			<div className="modal-header">
				{isTouchOrSmall ? (
					<Fragment>
						<TouchHeader
							isModal={true}
							className="darker"
							path={touchHeaderPath}
							searchBar={
								<SearchBar
									isActive={isSearchMode}
									onCancel={handleSearchModeToggle}
									search={
										<Search
											ref={searchRef}
											onSearch={handleSearch}
											qmode={navState.qmode}
											search={navState.search}
											autoFocus={true} // this appears after clicking an icon hence makes sense to auto-focus
										/>
									}
								/>
							}
							onNavigate={handleNavigation}
							navigationName="Picker"
						/>
						{ navState.libraryKey && (
							<button
								onClick={ handleSearchModeToggle }
								className={cx('btn-icon touch-modal-searchbar-toggle', { 'hidden': isSearchMode }) }
							>
								<Icon type={'24/search'} width="24" height="24" />
							</button>
						)}
					</Fragment>
				) : (
					<Fragment>
						<h4 className="modal-title truncate">
							Change Parent Item
						</h4>
						<div className="right" onBlur={receiveBlur} onFocus={receiveFocus} ref={rightRef} tabIndex={0}>
							<Search
								ref={ searchRef }
								onFocusNext={focusNext}
								onFocusPrev={focusPrev}
								onSearch={handleSearch}
								qmode={navState.qmode}
								search={navState.search}
							/>
							<Button
								icon
								className="close"
								onClick={handleCancel}
								onKeyDown={handleHeaderKeyDown}
								tabIndex={-2}
								title="Close Dialog"
							>
								<Icon type={'16/close'} width="16" height="16" />
							</Button>
						</div>
					</Fragment>
				)}
			</div>
			<div className={cx('modal-body', { [`view-${navState.view}-active`]: true }) }>
				<div className="sidebar">
					<Libraries {...sharedProps} includeLibraries={[libraryKey]} pickerAllowRoot={true} />
				</div>
				<div className={ cx('items', {
					'active': navState.view === 'item-list',
				})}>
					{ navState.libraryKey && (isTouchOrSmall ? <ItemsList {...sharedProps} /> : <ItemsTable {...sharedProps} />) }
				</div>
			</div>
			{isTouchOrSmall ? (
				<Fragment>
					<div className="modal-footer">
						<div className="modal-footer-left">
							<Button
								className="btn-link"
								onClick={ handleCancel }
							>
								Cancel
							</Button>
						</div>
						<div className="modal-footer-center">
							{canBeMovedOutOfParent && (
								<Button
									className="btn-link"
									onClick={handleUnparent}
								>
									{unparentLabel}
								</Button>
							)}
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={!isValidTarget}
								className="btn-link"
								onClick={handleSelectItems}
							>
								Select
							</Button>
						</div>
					</div>
				</Fragment>
			) : (
				<Fragment>
					<div className="modal-footer" onBlur={receiveFooterBlur} onFocus={receiveFooterFocus} ref={footerRef} tabIndex={0}>
						<div className="modal-footer-left">
						{canBeMovedOutOfParent && (
							<Button
								className="btn-link"
								onClick={handleUnparent}
								onKeyDown={handleFooterKeyDown}
								tabIndex={-2}
							>
								{unparentLabel}
							</Button>
						)}
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={!isValidTarget}
								className="btn-link"
								onClick={handleSelectItems}
								onKeyDown={handleFooterKeyDown}
								tabIndex={-2}
							>
								Select
							</Button>
						</div>
					</div>
				</Fragment>
			)}
			</FocusTrap>
		</Modal>
	);
}

ChangeParentItemModal.propTypes = {
	items: PropTypes.array,
}

export default memo(ChangeParentItemModal);

import { Button, Icon } from 'web-common/components';
import { Fragment, memo, useCallback, useEffect, useRef, useState } from 'react';
import { pick } from 'web-common/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusManager, usePrevious } from 'web-common/hooks';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { ADD_RELATED } from '../../constants/modals';
import { addRelatedItems, toggleModal, querySecondary } from '../../actions';
import { focusOnModalOpen } from '../../common/modal-focus';
import { PICKS_MULTIPLE_ITEMS } from '../../constants/picker-modes';
import { useNavigationState } from '../../hooks';
import ItemsList from '../item/items/list';
import ItemsTable from '../item/items/table';
import Libraries from '../../component/libraries';
import Modal from '../ui/modal';
import Search from '../search';
import TouchHeader from '../touch-header.jsx';
import SearchBar from '../touch-header/searchbar';
import FocusTrap from '../focus-trap';

const AddRelatedModal = () => {
	const dispatch = useDispatch();

	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemKeys = useSelector(state => state.current.itemKeys);
	const isOpen = useSelector(state => state.modal.id === ADD_RELATED);
	const isItemsReady = useSelector(state => state.current.itemKeys
		.every(key => state.libraries[state.current.libraryKey]?.dataObjects?.[key])
	);
	const columnsKey = 'addRelatedColumns';
	const wasItemsReady = usePrevious(isItemsReady);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { navState, touchHeaderPath, handleNavigation, resetNavState } = useNavigationState(PICKS_MULTIPLE_ITEMS, { libraryKey, collectionKey, view: 'item-list' });
	const [isBusy, setIsBusy] = useState(!isItemsReady);
	const [isSearchMode, setIsSearchMode] = useState(false); // on mobile need to toggle search mode on/off
	const wasOpen = usePrevious(isOpen);
	const searchRef = useRef(null);
	const rightRef = useRef(null);
	const beforeSearchView = useRef(null);
	const prevNavState = usePrevious(navState);
	const { receiveFocus, receiveBlur, focusNext, focusPrev } = useFocusManager(rightRef, { initialQuerySelector: 'input[type="search"]' });

	const sharedProps = {
		columnsKey,
		...pick(navState, ['libraryKey', 'collectionKey', 'view', 'q', 'qmode']),
		itemsSource: 'secondary',
		selectedItemKeys: navState.itemKeys || [], // or itemKeys?
		pickerMode: PICKS_MULTIPLE_ITEMS,
		pickerNavigate: handleNavigation
	};

	const handleSelectItems = useCallback(async () => {
		for (const sourceItemKey of itemKeys) {
			setIsBusy(true);
			await dispatch(addRelatedItems(sourceItemKey, navState.itemKeys));
			setIsBusy(false);
			dispatch(toggleModal(null, false));
		}
	}, [dispatch, itemKeys, navState.itemKeys]);


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

	const handleAfterOpen = useCallback(({ contentEl }) => {
		focusOnModalOpen(contentEl, isTouchOrSmall, () => {
			searchRef.current?.focus({ preventScroll: true });
		});
	}, [isTouchOrSmall]);

	const handleHeaderKeyDown = useCallback(ev => {
		if (ev.target !== ev.currentTarget) return;
		if (ev.key === 'ArrowRight') {
			focusNext(ev);
		} else if (ev.key === 'ArrowLeft') {
			focusPrev(ev);
		}
	}, [focusNext, focusPrev]);

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
			className="modal-touch modal-item-picker add-related-modal"
			contentLabel="Add Related Items"
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
							Add Related Items
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
							<h4 className="modal-title truncate">

							</h4>
						</div>
						<div className="modal-footer-right">
							<Button
								disabled={navState.itemKeys.length === 0}
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
					<div className="modal-footer justify-content-end">
						<Button
							disabled={navState.itemKeys.length === 0}
							className="btn-link"
							onClick={handleSelectItems}
						>
							Add
						</Button>
					</div>
				</Fragment>
			)}
			</FocusTrap>
		</Modal>
	);
}

AddRelatedModal.propTypes = {
	items: PropTypes.array,
}

export default memo(AddRelatedModal);

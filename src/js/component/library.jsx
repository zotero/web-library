import { DndProvider } from 'react-dnd-multi-backend';
import { Fragment, memo, useCallback, useEffect, useState, useRef } from 'react';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import cx from 'classnames';

import { get } from '../utils';
import { toggleNavbar, resetLibrary, fetchLibrarySettings } from '../actions';
import CustomDragLayer from '../component/drag-layer';
import ItemDetails from '../component/item/details';
import CurrentItems from '../component/item/current-items';
import CurrentLibraries from '../component/current-libraries';
import Messages from '../component/messages';
import MobileNav from './ui/mobile-nav';
import ModalManager from './modal-manager';
import Navbar from './ui/navbar';
import Ongoing from './ongoing';
import PreferencesObserver from './preferences-observer';
import Reader from './reader';
import SearchBackdrop from './search-backdrop';
import TagSelector from '../component/tag-selector';
import TitleUpdater from './title-updater';
import TouchDrilldown from '../component/touch-drilldown';
import TouchHeaderWrap from '../component/touch-header-wrap';
import TouchSideFooter from '../component/touch-side-footer';
import TouchTagSelector from '../component/touch-tag-selector';
import ZoteroConnectorNotifier from './zotero-connector-notifier';
import ZoteroStreamingClient from './zotero-streaming-client';


const Library = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const shouldUseSidebar = useSelector(state => state.device.shouldUseSidebar);
	const userType = useSelector(state => state.device.userType);
	const isKeyboardUser = useSelector(state => state.device.isKeyboardUser);
	const isMouseUser = useSelector(state => state.device.isMouseUser);
	const isTouchUser = useSelector(state => state.device.isTouchUser);
	const scrollbarWidth = useSelector(state => state.device.scrollbarWidth);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const isNavBarOpen = useSelector(state => state.current.isNavBarOpen);
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const noteKey = useSelector(state => state.current.noteKey);
	const search = useSelector(state => state.current.search);
	const searchState = useSelector(state => state.current.searchState);
	const tags = useSelector(state => state.current.tags);
	const useTransitions = useSelector(state => state.current.useTransitions);
	const view = useSelector(state => state.current.view);
	const isSynced = useSelector(state => get(state, ['libraries', libraryKey, 'sync', 'isSynced'], true));
	const menus = useSelector(state => state.config.menus);
	const colorScheme = useSelector(state => state.preferences.colorScheme);
	const isLibraryReadOnly = useSelector(state =>
		(state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isReadOnly
	);

	const wasSynced = usePrevious(isSynced);
	const prevUserType = usePrevious(userType);
	const prevShouldUseSidebar= usePrevious(shouldUseSidebar);
	const wasSearchMode = usePrevious(isSearchMode);
	// const prevItemsSource = usePrevious(itemsSource);

	const sectionNodeRef = useRef(null);
	const backdropNodeRef = useRef(null);

	const [hasUserTypeChanged, setHasUserTypeChanged] = useState(false);
	const [isSearchModeTransitioning, setIsSearchModeTransitioning] = useState(false);

	const isSearchQuery = search && search.length > 0;

	useEffect(() => {
		if(userType !== prevUserType && typeof(prevUserType) !== 'undefined') {
			setHasUserTypeChanged(true);
			setTimeout(() => setHasUserTypeChanged(false), 0);
		}

		if(isNavBarOpen && !shouldUseSidebar && prevShouldUseSidebar) {
			dispatch(toggleNavbar(false));
		}

		if (colorScheme) {
			document.documentElement.dataset.colorScheme = colorScheme;
		} else {
			delete document.documentElement.dataset.colorScheme;
		}
		document.documentElement.classList.toggle('keyboard', !!isKeyboardUser);
		document.documentElement.classList.toggle('mouse', !!isMouseUser);
		document.documentElement.classList.toggle('touch', !!isTouchUser);
		document.documentElement.classList.toggle('scrollbar-style-permanent', scrollbarWidth > 0);

	}, [colorScheme, dispatch, isKeyboardUser, isMouseUser, isNavBarOpen, isTouchUser, prevShouldUseSidebar, prevUserType, scrollbarWidth, shouldUseSidebar, userType]);

	useEffect(() => {
		if((isSearchMode && !wasSearchMode) || (!isSearchMode && wasSearchMode)) {
			setIsSearchModeTransitioning(true);
			setTimeout(() => setIsSearchModeTransitioning(false), 250);
		}
	}, [isSearchMode, wasSearchMode]);


	useEffect(() => {
		if(!isSynced && wasSynced) {
			setTimeout(() => {
				dispatch(resetLibrary(libraryKey));
				setTimeout(() => dispatch(fetchLibrarySettings(libraryKey, 'tagColors'), 0));
			}, 0);
		}
	}, [dispatch, libraryKey, isSynced, wasSynced])


	const handleNavbarToggle = useCallback(() => dispatch(toggleNavbar()), [dispatch]);

	return (
        <Fragment>
			<DndProvider options={ HTML5toTouch }>
			<CustomDragLayer />
			<div className={ cx('library-container', {
					'navbar-nav-opened': isNavBarOpen,
					'no-transitions': !useTransitions || hasUserTypeChanged,
					'search-active': (isSearchMode || (!isSearchMode && isSearchModeTransitioning)),
					'search-cancel': isSearchModeTransitioning && !isSearchMode,
					'search-init': (isSearchMode && !searchState.hasViewedResult) || (isSearchModeTransitioning && !isSearchMode),
					'search-results': (isSearchMode || (!isSearchMode && isSearchModeTransitioning)) && itemsSource === 'query' && isSearchQuery,
					'touch-tag-selector-active': tags.length > 0,
					'view-note-active': noteKey,
					'view-attachment-active': attachmentKey,
					[`view-${view}-active`]: true,
				}) }>
				<MobileNav />
				<div className="site-wrapper">
					{ view === 'reader' ? (
						<Reader />
					) : (
						<Fragment>
						<Navbar entries={ menus.desktop } />
						<main>
							<section className={ `library ${ view === 'library' ? 'active' : '' }` }>
								{ (isTouchOrSmall && isSingleColumn) && (
									<TouchHeaderWrap
										className="hidden-sm-up darker"
										variant={ TouchHeaderWrap.variants.MOBILE }
									/>
								) }
								<header className="sidebar">
									<h2 className="offscreen">Web library</h2>
									{ (isTouchOrSmall && !isSingleColumn) && (
										<TouchHeaderWrap
											variant={ TouchHeaderWrap.variants.NAVIGATION }
											className="hidden-xs-down hidden-mouse-md-up darker"
										/>
									) }
									<CurrentLibraries />
									{ isTouchOrSmall ? (
										<Fragment>
											<TouchTagSelector />
											<TouchSideFooter />
										</Fragment>
										) : <TagSelector /> }
									<Ongoing />
								</header>
								<CSSTransition
									in={ (isSingleColumn && isSearchMode) || !isSingleColumn }
									timeout={ 250 }
									classNames="fade"
									nodeRef={ sectionNodeRef }
									enter={ isSingleColumn && (view !== 'item-list' && view !== 'item-details') }
									exit={ isSingleColumn && (view !== 'item-list' && view !== 'item-details') }
								>
									<section ref={ sectionNodeRef } className={ cx('items', {
										'active': view === 'item-list',
										'select-mode': isTouchOrSmall && isSelectMode,
										'read-only': isLibraryReadOnly,
									})}>
										{/* Tablet TouchHeader */}
										{ (isTouchOrSmall && !isSingleColumn) && (
											<TouchHeaderWrap
												className="hidden-xs-down hidden-lg-up hidden-mouse darker"
												variant={ TouchHeaderWrap.variants.SOURCE_AND_ITEM }
											/>
										) }
										<CurrentItems isSearchModeTransitioning={ isSearchModeTransitioning } />
										<ItemDetails active={ view === 'item-details' } />
										{ isTouchOrSmall && <TouchDrilldown /> }
										<CSSTransition
											in={ isSingleColumn && isSearchMode && itemsSource !== 'query' }
											timeout={ 250 }
											classNames="fade"
											nodeRef={ backdropNodeRef }
											unmountOnExit
										>
											<SearchBackdrop ref={ backdropNodeRef } />
										</CSSTransition>
									</section>
								</CSSTransition>
							</section>
						</main>
						<div
							className="nav-cover"
							onClick={ handleNavbarToggle }
						/>
						</Fragment>
					)}
				</div>
				<ModalManager />
				<Messages />
			</div>
			</DndProvider>
			<ZoteroConnectorNotifier />
			<TitleUpdater />
			<ZoteroStreamingClient />
			<PreferencesObserver />
		</Fragment>
    );
}

export default memo(Library);

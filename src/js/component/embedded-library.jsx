import cx from 'classnames';
import { Fragment, memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'web-common/hooks';

import Items from './item/items';
import ItemDetails from './item/details';
import ZoteroStreamingClient from './zotero-streaming-client';
import { getSerializedQuery } from '../common/state';
import { get } from '../utils';
import EmbeddedHeader from './embedded/header';
import EmbeddedFooter from './embedded/footer';
import EmbeddedLibrariesTreeModal from './embedded/libraries-tree'
import Libraries from './libraries';
import TouchHeaderWrap from './touch-header-wrap';
import ItemsSortModal from './modal/items-sort';
import TouchTagSelector from './touch-tag-selector';
import{ toggleNavbar, resetLibrary, fetchLibrarySettings } from '../actions';


const Library = () => {
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const shouldUseSidebar = useSelector(state => state.device.shouldUseSidebar);
	const userType = useSelector(state => state.device.userType);
	const isKeyboardUser = useSelector(state => state.device.isKeyboardUser);
	const isMouseUser = useSelector(state => state.device.isMouseUser);
	const isTouchUser = useSelector(state => state.device.isTouchUser);
	const scrollbarWidth = useSelector(state => state.device.scrollbarWidth);
	const attachmentKey = useSelector(state => state.current.attachmentKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const isNavBarOpen = useSelector(state => state.current.isNavBarOpen);
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSelectMode = useSelector(state => state.current.isSelectMode);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const libraryKey = useSelector(state => state.current.libraryKey);
	const noteKey = useSelector(state => state.current.noteKey);
	const qmode = useSelector(state => state.current.qmode);
	const search = useSelector(state => state.current.search);
	const searchState = useSelector(state => state.current.searchState);
	const tags = useSelector(state => state.current.tags);
	const useTransitions = useSelector(state => state.current.useTransitions);
	const view = useSelector(state => state.current.view);
	const isSynced = useSelector(state => get(state, ['libraries', libraryKey, 'sync', 'isSynced'], true));

	const wasSynced = usePrevious(isSynced);
	const prevUserType = usePrevious(userType);
	const prevShouldUseSidebar= usePrevious(shouldUseSidebar);
	const wasSearchMode = usePrevious(isSearchMode);
	// const prevItemsSource = usePrevious(itemsSource);

	const [hasUserTypeChanged, setHasUserTypeChanged] = useState(false);
	const [isSearchModeTransitioning, setIsSearchModeTransitioning] = useState(false);

	const isSearchQuery = search && search.length > 0;

	useEffect(() => {
		if(userType !== prevUserType) {
			setHasUserTypeChanged(true);
			setTimeout(() => setHasUserTypeChanged(false), 0);
		}

		if(isNavBarOpen && !shouldUseSidebar && prevShouldUseSidebar) {
			dispatch(toggleNavbar(false));
		}

		document.documentElement.classList.toggle('keyboard', !!isKeyboardUser);
		document.documentElement.classList.toggle('mouse', !!isMouseUser);
		document.documentElement.classList.toggle('touch', !!isTouchUser);
		document.documentElement.classList.toggle('scrollbar-style-permanent', scrollbarWidth > 0);

	}, [dispatch, isKeyboardUser, isMouseUser, isNavBarOpen, isTouchUser, prevShouldUseSidebar, prevUserType, scrollbarWidth, shouldUseSidebar, userType]);

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


	//@TODO: use `useSourceSignature` hook inside components instead
	var key;
	if(itemsSource == 'collection') {
		key = `${libraryKey}-${collectionKey}`;
	} else if(itemsSource == 'query') {
		key = `${libraryKey}-query-${getSerializedQuery(
			{ collection: collectionKey, tag: tags, q: search, qmode }
		)}`;
	} else {
		key = `${libraryKey}-${itemsSource}`;
	}

	return (
        <Fragment>
			<div className={ cx('library-container', 'library-embedded', {
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
				<div className="site-wrapper">
					{ isTouchOrSmall ? (
						<Fragment>
							<TouchHeaderWrap
								className="darker"
								variant={ TouchHeaderWrap.variants.MOBILE }
							/>
							<main>
								<section className={ `library ${ view === 'library' ? 'active' : '' }` }>
									<div className="libraries-container">
										<Libraries />
									</div>
									<section className={ cx('items', {
										'active': view === 'item-list',
										'read-only': true,
									})}>
										<Items key={ key } />
										{ view === 'item-details' && (
											<ItemDetails active={ view === 'item-details' } />
										) }
									</section>
								</section>
							</main>
							<EmbeddedFooter />
						</Fragment>
					) : (
					<Fragment>
						<EmbeddedHeader />
							<main>
								<section className={ cx('items', {
									'select-mode': isTouchOrSmall && isSelectMode,
									'read-only': true,
								})}>
									{ view === 'item-details' ? <ItemDetails  /> : <Items key={ key } /> }
								</section>
							</main>
						<EmbeddedFooter />
					</Fragment>
					)}
					<TouchTagSelector />
					<EmbeddedLibrariesTreeModal />
				</div>
			</div>
			<ItemsSortModal />
			<ZoteroStreamingClient />
		</Fragment>
    );
}

export default memo(Library);

'use strict';

import cx from 'classnames';
import HTML5toTouch from 'react-dnd-multi-backend/lib/HTML5toTouch';
import MultiBackend from 'react-dnd-multi-backend';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import AddByIdentifierModalContainer from '../container/modal/add-by-identifier';
import AddItemsToCollectionsModalContainer from '../container/modal/add-items-to-collections';
import BibliographyModalContainer from '../container/modal/bibliography';
import CustomDragLayer from '../component/drag-layer';
import ExportModalContainer from '../container/modal/export';
import ItemDetailsContainer from '../container/item-details';
import ItemsContainer from '../container/items';
import ItemsSortModalContainer from '../container/modal/items-sort';
import LibrariesContainer from '../container/libraries';
import Messages from '../component/messages';
import MobileNav from './ui/mobile-nav';
import MoveCollectionsModalContainer from '../container/modal/move-collections';
import Navbar from './ui/navbar';
import NewCollectionModalContainer from '../container/modal/new-collection';
import NewFileModalContainer from '../container/modal/new-file';
import NewItemModalContainer from '../container/modal/new-item';
import RenameCollectionModalContainer from '../container/modal/rename-collection';
import SearchBackdrop from './search-backdrop';
import StyleInstallerModalContainer from '../container/modal/style-installer';
import TagSelectorContainer from '../container/tag-selector';
import TouchHeaderContainer from '../container/touch-header';
import TouchNoteContainer from '../container/touch-note';
import withDevice from '../enhancers/with-device';
import { DragDropContext } from 'react-dnd';
import { getSerializedQuery } from '../common/state';
import { NEW_FILE } from '../constants/modals'
import { pick } from '../common/immutable';


const Library = props => {
	const { collectionKey, config, device, isNavBarOpen, isSearchMode, isSelectMode, isSynced,
	itemsSource, libraryKey, noteKey, resetLibrary, search, searchState, tags, toggleModal,
	toggleNavbar, useTransitions, qmode, view } = props;

	const [hasUserTypeChanged, setHasUserTypeChanged] = useState(false);
	const [isSearchModeTransitioning, setIsSearchModeTransitioning] = useState(false);
	const prevUserType = useRef(device.userType);
	const prevShouldUseSidebar = useRef(device.shouldUseSidebar);
	const wasSearchMode = useRef(isSearchMode);
	const prevItemsSource = useRef(itemsSource);
	const wasSynced = useRef(isSynced);

	useEffect(() => {
		if(device.userType !== prevUserType.current) {
			setHasUserTypeChanged(true);
			setTimeout(() => setHasUserTypeChanged(false), 0);
		}

		if(isNavBarOpen && !device.shouldUseSidebar && prevShouldUseSidebar.current) {
			toggleNavbar(false);
		}

		document.documentElement.classList.toggle('keyboard', !!device.isKeyboardUser);
		document.documentElement.classList.toggle('mouse', !!device.isMouseUser);
		document.documentElement.classList.toggle('touch', !!device.isTouchUser);
		document.documentElement.classList.toggle('scrollbar-style-permanent', device.scrollbarWidth > 0);

		prevUserType.current = device.userType;
	}, [device]);

	useEffect(() => {
		if(isSearchMode && !wasSearchMode.current) {
			setIsSearchModeTransitioning(true);
			setTimeout(() => setIsSearchModeTransitioning(false), 250);
		}
		wasSearchMode.current = isSearchMode;
	}, [isSearchMode]);

	useEffect(() => {
		prevItemsSource.current = itemsSource
	}, [itemsSource]);

	useEffect(() => {
		if(!isSynced && wasSynced.current) {
			resetLibrary(libraryKey);
		}
		wasSynced.current = isSynced;
	}, [isSynced])

	const handleNavbarToggle = useCallback(
		() => toggleNavbar(null)
	);

	const handleDrop = useCallback(ev => {
		const files = Array.from(ev.dataTransfer.files);
		if(files.length) {
			toggleModal(NEW_FILE, true, { files });
		}
	});

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
		<React.Fragment>
			<CustomDragLayer />
			<div onDrop={ handleDrop } className={ cx('library-container', {
					[`view-${view}-active`]: true,
					'view-note-active': noteKey,
					'navbar-nav-opened': isNavBarOpen,
					'no-transitions': !useTransitions || hasUserTypeChanged,
					'search-active': (isSearchMode || (!isSearchMode && isSearchModeTransitioning)) && (itemsSource !== 'query' && prevItemsSource.current !== 'query'),
					'search-results': (isSearchMode || (!isSearchMode && isSearchModeTransitioning)) && (itemsSource === 'query' || prevItemsSource.current === 'query'),
					'search-init': (isSearchMode && !searchState.hasViewedResult) || (isSearchModeTransitioning && !isSearchMode),
					'search-cancel': isSearchModeTransitioning && !isSearchMode,
				}) }>
				<MobileNav
					entries={ config.menus.mobile }
					{...pick(props, ['toggleNavbar']) }
				/>
				<div className="site-wrapper">
					<Navbar
						entries={ config.menus.desktop }
						{...pick(props, ['collectionKey', 'isNavBarOpen', 'isMyPublications', 'isTrash',
							'itemsSource', 'libraryKey', 'navigate', 'qmode', 'search', 'tags', 'toggleNavbar',
							'triggerSearchMode', 'view',
						])}
					/>
					<main>
						<section className={ `library ${ view === 'library' ? 'active' : '' }` }>
							<TouchHeaderContainer
								className="hidden-sm-up darker"
								variant={ TouchHeaderContainer.variants.MOBILE }
							/>
							<header className="sidebar">
								<h2 className="offscreen">Web library</h2>
								<TouchHeaderContainer
									variant={ TouchHeaderContainer.variants.NAVIGATION }
									className="hidden-xs-down hidden-mouse-md-up darker"
								/>
								<LibrariesContainer />
								{ !device.isTouchOrSmall &&
									<TagSelectorContainer key={ key } />
								}
							</header>
							<CSSTransition
								in={ (device.isSingleColumn && isSearchMode) || !device.isSingleColumn }
								timeout={ 250 }
								classNames="fade"
								enter={ device.isSingleColumn && (view !== 'item-list' && view !== 'item-details') }
								exit={ device.isSingleColumn && (view !== 'item-list' && view !== 'item-details') }
							>
								<section className={ cx('items', {
									'active': view === 'item-list',
									'select-mode': isSelectMode
								})}>
									{/* Tablet TouchHeader */}
									<TouchHeaderContainer
										className="hidden-xs-down hidden-md-up darker"
										variant={ TouchHeaderContainer.variants.SOURCE_AND_ITEM }
									/>
									<ItemsContainer key={ key } { ...{isSearchModeTransitioning} } />
									<ItemDetailsContainer active={ view === 'item-details' } />
									{ device.isTouchOrSmall && <TouchNoteContainer /> }
									<CSSTransition
										in={ device.isSingleColumn && isSearchMode && itemsSource !== 'query' }
										timeout={ 250 }
										classNames="fade"
										unmountOnExit
									>
										<SearchBackdrop { ...pick(props, ['triggerSearchMode']) } />
									</CSSTransition>
								</section>
							</CSSTransition>
						</section>
					</main>
					<div
						className="nav-cover"
						onClick={ handleNavbarToggle }
					/>
				</div>
				<AddItemsToCollectionsModalContainer />
				<BibliographyModalContainer />
				<ExportModalContainer />
				<ItemsSortModalContainer />
				<MoveCollectionsModalContainer />
				<NewCollectionModalContainer />
				<NewItemModalContainer />
				<RenameCollectionModalContainer />
				<StyleInstallerModalContainer />
				<AddByIdentifierModalContainer />
				<NewFileModalContainer />
				<Messages />
			</div>
		</React.Fragment>
	);
}

Library.propTypes = {
	collectionKey: PropTypes.string,
	config: PropTypes.object.isRequired,
	device: PropTypes.object,
	isNavBarOpen: PropTypes.bool,
	isSearchMode: PropTypes.bool,
	isSelectMode: PropTypes.bool,
	isSynced: PropTypes.bool,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	noteKey: PropTypes.string,
	qmode: PropTypes.string,
	resetLibrary: PropTypes.func,
	search: PropTypes.string,
	searchState: PropTypes.object,
	tags: PropTypes.array,
	toggleModal: PropTypes.func,
	toggleNavbar: PropTypes.func,
	useTransitions: PropTypes.bool,
	view: PropTypes.string,
};

export default withDevice(DragDropContext(MultiBackend(HTML5toTouch))(Library));

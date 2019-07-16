'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';

import { getSerializedQuery } from '../common/state';
import LibrariesContainer from '../container/libraries';
import ItemDetailsContainer from '../container/item-details';
import ItemsContainer from '../container/items';
import Navbar from './ui/navbar';
import MobileNav from './ui/mobile-nav';
import TagSelectorContainer from '../container/tag-selector';
import TouchHeaderContainer from '../container/touch-header';
import BibliographyModalContainer from '../container/modal/bibliography';
import RenameCollectionModalContainer from '../container/modal/rename-collection';
import NewCollectionModalContainer from '../container/modal/new-collection';
import AddItemsToCollectionsModalContainer from '../container/modal/add-items-to-collections';
import NewItemModalContainer from '../container/modal/new-item';
import ExportModalContainer from '../container/modal/export';
import StyleInstallerModalContainer from '../container/modal/style-installer';
import ItemsSortModalContainer from '../container/modal/items-sort';
import MoveCollectionsModalContainer from '../container/modal/move-collections';
import AddByIdentifierModalContainer from '../container/modal/add-by-identifier';
import SearchBackdrop from './search-backdrop';
import withDevice from '../enhancers/with-device';
import Icon from './ui/icon';
import { pick } from '../common/immutable';

class Library extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			hasUserTypeChanged: false,
			isSearchModeTransitioning: false,
			prevItemsSource: null,
		};
	}

	componentDidUpdate({ device: prevDevice, isSearchMode: wasSearchMode,
			itemsSource: prevItemsSource }, {
			isSearchModeTransitioning: wasSearchModeTransitioning
		}) {
		const wasTouchOrSmall = prevDevice.isTouchOrSmall;
		const prevUserType = prevDevice.userType;
		const { device, isSearchMode, toggleNavbar, isNavBarOpen } = this.props;
		const { hasUserTypeChanged, isSearchModeTransitioning } = this.state;

		document.documentElement.classList.toggle('keyboard', !!device.isKeyboardUser);
		document.documentElement.classList.toggle('mouse', !!device.isMouseUser);
		document.documentElement.classList.toggle('touch', !!device.isTouchUser);
		document.documentElement.classList.toggle(
			'scrollbar-style-permanent',
			device.scrollbarWidth > 0
		);

		if(device.isTouchOrSmall !== wasTouchOrSmall && device.userType !== prevUserType) {
			this.setState({ hasUserTypeChanged: true });
		}
		if(hasUserTypeChanged === true) {
			window.setTimeout(() => this.setState({ hasUserTypeChanged: false }));
		}
		if(wasSearchMode !== isSearchMode) {
			this.setState({ isSearchModeTransitioning: true });
			if(wasSearchMode) {
				this.setState({ prevItemsSource });
			} else {
				this.setState({ prevItemsSource: null });
			}
		}
		if(isSearchModeTransitioning && !wasSearchModeTransitioning) {
			setTimeout(() => this.setState({ isSearchModeTransitioning: false }), 250);
		}

		if(isNavBarOpen && !device.shouldUseSidebar && prevDevice.shouldUseSidebar) {
			toggleNavbar(false);
		}
	}

	componentWillUnmount() {
		document.documentElement.classList.toggle('keyboard', false);
		document.documentElement.classList.toggle('mouse', false);
		document.documentElement.classList.toggle('touch', false);
	}

	handleNavbarToggle = () => this.props.toggleNavbar(null);

	render() {
		const { libraryKey, collectionKey = '', itemsSource, search, tags, qmode } = this.props;
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

		const { config, device, isSearchMode, isNavBarOpen, isSelectMode, searchState,
			toggleNavbar, useTransitions, view } = this.props;
		const { hasUserTypeChanged, isSearchModeTransitioning, prevItemsSource } = this.state;
		let activeViewClass = `view-${view}-active`;

		return (
			<div className={ cx('library-container', activeViewClass, {
					'navbar-nav-opened': isNavBarOpen,
					'no-transitions': !useTransitions || hasUserTypeChanged,
					'search-active': (isSearchMode || (!isSearchMode && isSearchModeTransitioning)) && (itemsSource !== 'query' && prevItemsSource !== 'query'),
					'search-results': (isSearchMode || (!isSearchMode && isSearchModeTransitioning)) && (itemsSource === 'query' || prevItemsSource === 'query'),
					'search-init': (isSearchMode && !searchState.hasViewedResult) || (isSearchModeTransitioning && !isSearchMode),
					'search-cancel': isSearchModeTransitioning && !isSearchMode,
				}) }>
				{
					!useTransitions && (
						<div className="loading-cover">
							<Icon type={ '32/z' } width="32" height="32" />
						</div>
					)
				}
				<MobileNav
					entries={ config.menus.mobile }
					{...pick(this.props, ['toggleNavbar']) }
				/>
				<div className="site-wrapper">
					<Navbar
						entries={ config.menus.desktop }
						{...pick(this.props, ['collectionKey', 'isNavBarOpen', 'isMyPublications', 'isTrash',
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
									<section className="rich-editor-touch hidden-mouse">Touch Editor</section>
									<CSSTransition
										in={ device.isSingleColumn && isSearchMode && itemsSource !== 'query' }
										timeout={ 250 }
										classNames="fade"
										unmountOnExit
									>
										<SearchBackdrop { ...pick(this.props, ['triggerSearchMode']) } />
									</CSSTransition>
								</section>
							</CSSTransition>
						</section>
					</main>
					<div
						className="nav-cover"
						onClick={ this.handleNavbarToggle }
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
			</div>
		);
	}
}

Library.propTypes = {
	config: PropTypes.object.isRequired,
	isSelectMode: PropTypes.bool,
	view: PropTypes.string,
};

export default withDevice(Library);

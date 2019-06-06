'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { CSSTransition } from 'react-transition-group';

import { getSerializedQuery } from '../common/state';
import Spinner from './ui/spinner';
import LibrariesContainer from '../container/libraries';
import ItemDetailsContainer from '../container/item-details';
import ItemsContainer from '../container/items';
import Navbar from './ui/navbar';
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
import withDevice from '../enhancers/with-device';
import Icon from './ui/icon';
import { pick } from '../common/immutable';

class Library extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isNavOpened: false,
			hasUserTypeChanged: false
		};
	}

	handleNavToggle() {
		this.setState({
			isNavOpened: !this.state.isNavOpened
		});
	}

	componentDidUpdate({ device: { isTouchOrSmall: wasTouchOrSmall, userType: previousUserType } }) {
		const { device } = this.props;
		const { hasUserTypeChanged } = this.state;

		document.documentElement.classList.toggle('keyboard', !!device.isKeyboardUser);
		document.documentElement.classList.toggle('mouse', !!device.isMouseUser);
		document.documentElement.classList.toggle('touch', !!device.isTouchUser);
		document.documentElement.classList.toggle(
			'scrollbar-style-permanent',
			device.scrollbarWidth > 0
		);

		if(device.isTouchOrSmall !== wasTouchOrSmall && device.userType !== previousUserType) {
			this.setState({ hasUserTypeChanged: true });
		}
		if(hasUserTypeChanged === true) {
			window.setTimeout(() => this.setState({ hasUserTypeChanged: false }));
		}
	}

	componentWillUnmount() {
		document.documentElement.classList.toggle('keyboard', false);
		document.documentElement.classList.toggle('mouse', false);
		document.documentElement.classList.toggle('touch', false);
	}

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

		const { device, isSearchMode, isSelectMode, useTransitions, view } = this.props;
		const { isNavOpened, hasUserTypeChanged } = this.state;
		let activeViewClass = `view-${view}-active`;

		return (
			<div className={ cx('library-container', activeViewClass, {
					'navbar-nav-opened': isNavOpened,
					'no-transitions': !useTransitions || hasUserTypeChanged,
					'search-active': isSearchMode && itemsSource !== 'query',
					'search-results': isSearchMode && itemsSource === 'query' && view !== 'item-details',
				}) }>
				{
					!useTransitions && (
						<div className="loading-cover">
							<Icon type={ '32/z' } width="32" height="32" />
						</div>
					)
				}
				<Navbar
					isOpened = { isNavOpened }
					onToggle = { this.handleNavToggle.bind(this) }
					{...pick(this.props, ['collectionKey', 'isMyPublications', 'isTrash',
						'itemsSource', 'libraryKey', 'navigate', 'qmode', 'search', 'tags',
						'triggerSearchMode', 'view',
					])}
				/>
				<div className="nav-cover" />
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
								<ItemsContainer key={ key } />
								<ItemDetailsContainer active={ view === 'item-details' } />
								<CSSTransition
									in={ device.isSingleColumn && isSearchMode && itemsSource !== 'query' }
									timeout={ 250 }
									classNames="fade"
									unmountOnExit
								>
									<div className="search-backdrop" />
								</CSSTransition>
							</section>
						</CSSTransition>
					</section>
				</main>
				<AddItemsToCollectionsModalContainer />
				<BibliographyModalContainer />
				<ExportModalContainer />
				<ItemsSortModalContainer />
				<MoveCollectionsModalContainer />
				<NewCollectionModalContainer />
				<NewItemModalContainer />
				<RenameCollectionModalContainer />
				<StyleInstallerModalContainer />
			</div>
		);
	}
}

Library.propTypes = {
	view: PropTypes.string,
	isSelectMode: PropTypes.bool
};

export default withDevice(Library);

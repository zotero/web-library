import React, { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Nav } from 'reactstrap/lib';

import Button from './button';
import Icon from './icon';
import Search from './../../component/search';
import MenuEntry from './menu-entry';
import { isTriggerEvent } from '../../common/event';
import { navigate, toggleNavbar, triggerSearchMode, navigateExitSearch, toggleTouchTagSelector } from '../../actions';
import { useFocusManager } from '../../hooks';


const Navbar = memo(props => {
	const ref = useRef(null);
	const dispatch = useDispatch();
	const { entries } = props;

	const { receiveFocus, receiveBlur, focusNext, focusPrev, registerAutoFocus } = useFocusManager(ref);
	const view = useSelector(state => state.current.view);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isSearchMode = useSelector(state => state.current.isSearchMode);

	const handleSearchButtonClick = useCallback(() => {
		if(isSearchMode) {
			dispatch(triggerSearchMode(false));
			dispatch(navigateExitSearch());
		} else {
			dispatch(triggerSearchMode(true));

			if(itemsSource === 'query' && view === 'item-details') {
				dispatch(navigate({ view: 'item-list' }));
			}
		}
	}, [dispatch, itemsSource, isSearchMode, view]);

	const handleTagSelectorClick = useCallback(() => {
		dispatch(toggleTouchTagSelector());
	}, [dispatch]);

	const handleKeyDown = useCallback(ev => {

		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(isTriggerEvent(ev) && ev.target.dataset.navbarToggle) {
			setTimeout(() => {
				document.querySelector('.nav-sidebar').focus();
			}, 200);
		} else if(ev.key === 'ArrowRight') {
			focusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			focusPrev(ev);
		}
	}, [focusNext, focusPrev]);

	const handleNavbarToggle = useCallback(() => {
		dispatch(toggleNavbar(null));
	}, [dispatch]);

	return (
		<header
			className="navbar"
			onBlur={ receiveBlur }
			onFocus={ receiveFocus }
			ref={ ref }
			tabIndex={ 0 }
		>
			<h1 className="navbar-brand">
				<a
					href="/"
					onKeyDown={ handleKeyDown }
					tabIndex={ -2 }
				>
					Zotero
				</a>
			</h1>
			<h2 className="offscreen">Site navigation</h2>
			<nav>
				<Nav className="main-nav">
					{ entries.filter(e => e.position === 'left' || !e.position).map( entry => (
						<MenuEntry
							key={ entry.href || entry.label }
							onKeyDown={handleKeyDown}
							{ ...entry }
						/>
					)) }
				</Nav>
			</nav>
			<Search
				autoFocus
				onFocusNext={ focusNext }
				onFocusPrev={ focusPrev }
				registerAutoFocus={ registerAutoFocus }
			/>
			{ view !== 'libraries' && (
				<React.Fragment>
					<Button
						onClick={ handleSearchButtonClick }
						icon
						className="search-toggle hidden-sm-up"
						aria-label="Toggle search"
					>
						<Icon type={ '24/search' } width="24" height="24" />
					</Button>
					<Button
						onClick={ handleTagSelectorClick }
						icon
						className="touch-tag-selector-toggle hidden-sm-up"
						aria-label="Toggle tag selector"
					>
						<Icon type="24/tag-strong" width="24" height="24" />
					</Button>
				</React.Fragment>
			) }
			<Button
				icon
				data-navbar-toggle
				className="navbar-toggle hidden-lg-up"
				aria-label="Toggle navigation"
				onClick={ handleNavbarToggle }
				onKeyDown={ handleKeyDown }
				tabIndex={ -2 }
			>
				<span className="icon-bar"></span>
				<span className="icon-bar"></span>
				<span className="icon-bar"></span>
			</Button>
			{ entries.filter(e => e.position === 'right').map( entry => (
				<MenuEntry
					key={ entry.href || entry.label }
					onKeyDown={ handleKeyDown }
					{ ...entry }
				/>
			)) }
		</header>
	);
});

Navbar.displayName = 'Navbar';

Navbar.propTypes = {
	entries: PropTypes.array,
}

Navbar.defaultProps = {
	entries: []
}

export default Navbar;

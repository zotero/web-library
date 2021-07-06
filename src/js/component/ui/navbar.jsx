import PropTypes from 'prop-types';
import React, { memo, useCallback, useRef } from 'react';
import { default as Nav } from 'reactstrap/lib/Nav';
import { useDispatch, useSelector } from 'react-redux';

import Button from './button';
import Icon from './icon';
import MenuEntry from './menu-entry';
import Search from './../../component/search';
import { currentTriggerSearchMode, toggleNavbar, toggleTouchTagSelector } from '../../actions';
import { isTriggerEvent } from '../../common/event';
import { useFocusManager } from '../../hooks';

const Navbar = memo(({ entries = [] }) => {
	const ref = useRef(null);
	const dispatch = useDispatch();

	const { receiveFocus, receiveBlur, focusNext, focusPrev, registerAutoFocus } = useFocusManager(ref);
	const isLibrariesView = useSelector(state => state.current.view === 'libraries');

	const handleSearchButtonClick = useCallback(() => {
		dispatch(currentTriggerSearchMode());
	}, [dispatch]);

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
			{ !isLibrariesView && (
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

export default Navbar;

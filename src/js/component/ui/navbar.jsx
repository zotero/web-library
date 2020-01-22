import React, { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Nav } from 'reactstrap/lib';

import Button from './button';
import Icon from './icon';
import SearchContainer from './../../container/search';
import MenuEntry from './menu-entry';
import { isTriggerEvent } from '../../common/event';
import { navigate, toggleNavbar, triggerSearchMode } from '../../actions';
import { useFocusManager } from '../../hooks';


const Navbar = memo(props => {
	const ref = useRef(null);
	const dispatch = useDispatch();
	const { entries } = props;

	const { handleFocus, handleBlur, handleNext, handlePrevious, registerAutoFocus } = useFocusManager(ref);
	const view = useSelector(state => state.current.view);
	const itemsSource = useSelector(state => state.current.itemsSource);

	const handleSearchButtonClick = useCallback(() => {
		dispatch(triggerSearchMode(true));

		if(itemsSource === 'query' && view === 'item-details') {
			dispatch(navigate({ view: 'item-list' }));
		}
	});

	const handleTagSelectorClick = useCallback(() => {

	});

	const handleKeyDown = useCallback(ev => {

		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(isTriggerEvent(ev) && ev.target.dataset.navbarToggle) {
			setTimeout(() => {
				document.querySelector('.nav-sidebar').focus();
			}, 200);
		} else if(ev.key === 'ArrowRight') {
			handleNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			handlePrevious(ev);
		}
	});

	const handleNavbarToggle = useCallback(() => {
		dispatch(toggleNavbar(null));
	});

	return (
		<header
			className="navbar"
			onBlur={ handleBlur }
			onFocus={ handleFocus }
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
			<SearchContainer
				autoFocus
				onFocusNext={ handleNext }
				onFocusPrev={ handlePrevious }
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

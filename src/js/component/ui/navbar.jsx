import PropTypes from 'prop-types';
import { Fragment, memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';
import { useFocusManager } from 'web-common/hooks';
import { isTriggerEvent } from 'web-common/utils';

import MenuEntry from './menu-entry';
import MainSearch from './../../component/main-search';
import { SETTINGS } from '../../constants/modals';
import { currentTriggerSearchMode, toggleModal,
	toggleNavbar, toggleTouchTagSelector } from '../../actions';

const Navbar = memo(({ entries = [] }) => {
	const ref = useRef(null);
	const dispatch = useDispatch();

	const { receiveFocus, receiveBlur, focusNext, focusPrev, registerAutoFocus } = useFocusManager(ref);
	const isLibrariesView = useSelector(state => state.current.view === 'libraries');
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const colorScheme = useSelector(state => state.preferences.colorScheme);

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

	const handleSettingsButtonClick = useCallback(() => {
		dispatch(toggleModal(SETTINGS, true));
	}, [dispatch]);

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
					<Icon
						width={ isSingleColumn ? 84 : 96 }
						height={ isSingleColumn ? 22 : 26 }
						useColorScheme={ true }
						colorScheme={ colorScheme }
						type="zotero-logo"
						label="Zotero"
					/>
				</a>
			</h1>
			<h2 id="site-navigation" className="offscreen">Site navigation</h2>
			<nav aria-labelledby="site-navigation">
				<ul className="main-nav nav">
					{ entries.filter(e => e.position === 'left' || !e.position).map( entry => (
						<MenuEntry
							key={ entry.href || entry.label }
							onKeyDown={handleKeyDown}
							{ ...entry }
						/>
					)) }
				</ul>
			</nav>
			<MainSearch
				autoFocus
				onFocusNext={ focusNext }
				onFocusPrev={ focusPrev }
				registerAutoFocus={ registerAutoFocus }
			/>

			{ isSingleColumn && !isLibrariesView && (
				<Fragment>
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
				</Fragment>
			) }
				<Button
					aria-label="Open Settings"
					className="settings-toggle"
					icon
					onClick={ handleSettingsButtonClick }
					onKeyDown={handleKeyDown}
					tabIndex={-2}
				>
					<Icon type={'16/cog'} width="24" height="24" />
				</Button>
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

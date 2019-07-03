'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import Button from './button';
import Icon from './icon';
import SearchContainer from './../../container/search';
import withFocusManager from '../../enhancers/with-focus-manager.jsx';
import { isTriggerEvent } from '../../common/event';
import { pick } from '../../common/immutable';
import { Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

class MenuEntry extends React.PureComponent {
	render() {
		const {label, href, handleKeyDown, dropdown, entries, active} = this.props;
		if (dropdown) {
			let dropdownEntries = entries.map((entry, ind) => {
				if (entry.separator) {
					return <DropdownItem key={`divider-${ind}`} divider />;
				}
				return <DropdownItem key={entry.href} href={entry.href}>{entry.label}</DropdownItem>
			});
			
			return (<NavItem active={active}>
				<UncontrolledDropdown className="dropdown dropdown-wrapper">
					<DropdownToggle
						tag="a"
						href="#"
						className="dropdown-toggle nav-link"
						onKeyDown={ handleKeyDown }
						tabIndex={ -2 }
					>
						{label}
						<Icon type="16/chevron-9" width="16" height="16" />
					</DropdownToggle>
					<DropdownMenu>
						{dropdownEntries}
					</DropdownMenu>
				</UncontrolledDropdown>
			</NavItem>);
		}
		return (
			<NavItem active={active}>
				<NavLink href={href} onKeyDown={ handleKeyDown } tabIndex={ -2 }>{label}</NavLink>
			</NavItem>
		);
	}
}
MenuEntry.propTypes = {
	label: PropTypes.string,
	href: PropTypes.string,
	handleKeyDown: PropTypes.func,
	dropdown: PropTypes.bool,
	entries: PropTypes.array,
	active: PropTypes.bool,
};
MenuEntry.defaultProps = {
	active:false
};

class Navbar extends React.PureComponent {
	constructor(props) {
		super(props);
		const menuConfigDom = document.getElementById('zotero-web-library-menu-config');
		const config = menuConfigDom ? JSON.parse(menuConfigDom.textContent) : {};

		this.state = {
			menus: config
		};
	}

	handleSearchButtonClick = () => {
		const { libraryKey: library, collectionKey: collection, tags,
			isTrash: trash, isMyPublications: publications, qmode,
			navigate, view, triggerSearchMode, search, itemsSource } = this.props;

		triggerSearchMode(true);

		if(itemsSource === 'query' && view === 'item-details') {
			navigate({ library, tags, collection, trash, publications, search, qmode, view: 'item-list' });
		}
	}

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(isTriggerEvent(ev) && ev.target.dataset.navbarToggle) {
			setTimeout(() => {
				document.querySelector('.nav-sidebar').focus();
			}, 200);
		} else if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}

	render() {
		const { toggleNavbar, view } = this.props;
		const { onFocus, onBlur, registerFocusRoot } = this.props;
		
		const {menus} = this.state;
		const desktopMenuEntries = menus.desktop.map((entry) => {
			return <MenuEntry key={entry.href || entry.label} {...entry} handleKeyDown={this.handleKeyDown} />;
		})
		return (
			<header
				className="navbar"
				onBlur={ onBlur }
				onFocus={ onFocus }
				ref={ ref => registerFocusRoot(ref) }
				tabIndex={ 0 }
			>
				<h1 className="navbar-brand">
					<a
						href="/"
						onKeyDown={ this.handleKeyDown }
						tabIndex={ -2 }
					>
						Zotero
					</a>
				</h1>
				<h2 className="offscreen">Site navigation</h2>
				<Nav className='main-nav'>
					{desktopMenuEntries}
				</Nav>
				<SearchContainer
					autoFocus
					{ ...pick(this.props, ['onFocusNext', 'onFocusPrev', 'registerAutoFocus']) }
				/>
				{ view !== 'libraries' && (
					<Button
						onClick={ this.handleSearchButtonClick }
						icon
						className="search-toggle hidden-sm-up"
					>
						<Icon type={ '24/search' } width="24" height="24" />
					</Button>
				) }
				<Button
					icon
					data-navbar-toggle
					className="navbar-toggle hidden-lg-up"
					onClick={ toggleNavbar }
					onKeyDown={ this.handleKeyDown }
					tabIndex={ -2 }
				>
					<span className="icon-bar"></span>
					<span className="icon-bar"></span>
					<span className="icon-bar"></span>
				</Button>
				<Button
					className="btn-secondary hidden-md-down upgrade-storage"
					onKeyDown={ this.handleKeyDown }
					tabIndex={ -2 }
				>
					Upgrade Storage
				</Button>
			</header>
		);
	}
}

Navbar.propTypes = {
	collectionKey: PropTypes.string,
	isMyPublications: PropTypes.bool,
	isNavBarOpen: PropTypes.bool,
	isTrash: PropTypes.bool,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	navigate: PropTypes.func,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	qmode: PropTypes.string,
	registerFocusRoot: PropTypes.func,
	search: PropTypes.string,
	tags: PropTypes.array,
	toggleNavbar: PropTypes.func,
	triggerSearchMode: PropTypes.func,
	view: PropTypes.string,
};

export default withFocusManager(Navbar);

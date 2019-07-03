'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import Button from './button';
import Icon from './icon';
import SearchContainer from './../../container/search';
import withFocusManager from '../../enhancers/with-focus-manager.jsx';
import MenuEntry from './menu-entry';
import { isTriggerEvent } from '../../common/event';
import { pick } from '../../common/immutable';
import { Nav } from 'reactstrap/lib';

class Navbar extends React.PureComponent {
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

	handleNavbarToggle = () => this.props.toggleNavbar(null);

	render() {
		const { entries, view } = this.props;
		const { onFocus, onBlur, registerFocusRoot } = this.props;

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
					{ entries.map( entry => (
						<MenuEntry
							key={ entry.href || entry.label }
							handleKeyDown={this.handleKeyDown}
							{ ...entry }
						/>
					)) }
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
					onClick={ this.handleNavbarToggle }
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

	static propTypes = {
		collectionKey: PropTypes.string,
		entries: PropTypes.array,
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
	}
	static defaultProps = {
		entries: []
	}
}

export default withFocusManager(Navbar);

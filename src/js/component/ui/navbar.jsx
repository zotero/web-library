'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import Button from './button';
import Icon from './icon';
import SearchContainer from './../../container/search';
import withFocusManager from '../../enhancers/with-focus-manager.jsx';
import { pick } from '../../common/immutable';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

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

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}

	render() {
		const { toggleNavbar, view } = this.props;
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
				<nav>
					<ul className="main-nav">
						<li className="nav-item active">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								My Library
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Groups
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Documentation
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Forums
							</a>
						</li>
						<li className="nav-item">
							<a
								href="#"
								className="nav-link"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Get Involved
							</a>
						</li>
						<li className="nav-item">
							<UncontrolledDropdown className="dropdown dropdown-wrapper">
								<DropdownToggle
									tag="a"
									href="#"
									className="dropdown-toggle nav-link"
									onKeyDown={ this.handleKeyDown }
									tabIndex={ -2 }
								>
									User Name
								</DropdownToggle>
								<DropdownMenu>
									<DropdownItem>
										My Profile
									</DropdownItem>
									<DropdownItem divider />
									<DropdownItem>
										Inbox
									</DropdownItem>
									<DropdownItem divider />
									<DropdownItem>
										Settings
									</DropdownItem>
									<DropdownItem>
										Log Out
									</DropdownItem>
								</DropdownMenu>
							</UncontrolledDropdown>
						</li>
					</ul>
				</nav>

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
	qmode: PropTypes.string,
	search: PropTypes.string,
	tags: PropTypes.array,
	triggerSearchMode: PropTypes.func,
	toggleNavbar: PropTypes.func,
	view: PropTypes.string,
};

export default withFocusManager(Navbar);

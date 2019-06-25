'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import SearchContainer from './../../container/search';
import Button from './button';
import Icon from './icon';
import withFocusManager from '../../enhancers/with-focus-manager.jsx';
import { pick } from '../../common/immutable';

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
				<nav className="navbar-nav">
					<ul className="nav">
						<li className="active">
							<a
								href="#"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								My Library
							</a>
						</li>
						<li>
							<a
								href="#"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Groups
							</a>
						</li>
						<li>
							<a
								href="#"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Documentation
							</a>
						</li>
						<li>
							<a
								href="#"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Forums
							</a>
						</li>
						<li>
							<a
								href="#"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								Get Involved
							</a>
						</li>
						<li>
							<a
								href="#"
								onKeyDown={ this.handleKeyDown }
								tabIndex={ -2 }
							>
								User Name
							</a>
						</li>

					</ul>
				</nav>

				<SearchContainer { ...pick(this.props, ['onFocusNext', 'onFocusPrev']) } />
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

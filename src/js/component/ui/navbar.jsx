'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import SearchContainer from './../../container/search';
import Button from './button';
import Icon from './icon';

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

	render() {
		const { toggleNavbar } = this.props;
		return (
			<header className="navbar">
				<div className="navbar-left">
					<h1 className="navbar-brand"><a href="/">Zotero</a></h1>
					<h2 className="offscreen">Site navigation</h2>
					<nav className="navbar-nav">
						<ul className="nav">
							<li><a href="#">Feed</a></li>
							<li className="active"><a href="#">Library</a></li>
							<li><a href="#">Groups</a></li>
						</ul>
					</nav>
				</div>
				<div className="navbar-right">
					<SearchContainer />
					<a href="#" className="user-profile-link"></a>
					<Button
						onClick={ this.handleSearchButtonClick }
						icon
						className="search-toggle hidden-sm-up"
					>
						<Icon type={ '24/search' } width="24" height="24" />
					</Button>
					<Button icon className="navbar-toggle" onClick={ toggleNavbar }>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
					</Button>
				</div>
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

export default Navbar;

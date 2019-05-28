'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import SearchContainer from './../../container/search';
import Button from './button';
import Icon from './icon';

class Navbar extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			navOpened: false
		};
	}

	render() {
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
					<Button icon className="search-toggle hidden-sm-up">
						<Icon type={ '24/search' } width="24" height="24" />
					</Button>
					<Button icon className="navbar-toggle" onClick={ ev => this.props.onToggle(ev) }>
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
	onToggle: PropTypes.func.isRequired,
	isOpened: PropTypes.bool
};

Navbar.defaultProps = {
	isOpened: false
};

export default Navbar;

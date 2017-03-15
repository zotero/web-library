'use strict';

import React from 'react';

import InjectableComponentsEnhance from '../../enhancers/injectable-components-enhancer';

class Navbar extends React.Component {
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
					<a href="#" className="search">Search</a>
					<a href="#" className="user-profile-link"></a>
					<button className="navbar-toggle" onClick={ ev => this.props.onToggle(ev) }>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
					</button>
				</div>
			</header>
		);
	}
}

Navbar.propTypes = {
	onToggle: React.PropTypes.func.isRequired,
	isOpened: React.PropTypes.bool
};

Navbar.defaultProps = {
	isOpened: false
};

export default InjectableComponentsEnhance(Navbar);
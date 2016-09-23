'use strict';

import React from 'react';

export default class Navbar extends React.Component {
	render() {
		return <header className="navbar">
			<h1 className="navbar-brand"><a href="/">Zotero</a></h1>
			<nav className="navbar-nav">
				<h2 className="offscreen">Site navigation</h2>
				<ul className="nav">
					<li><a href="#">Feed</a></li>
					<li className="active"><a href="#">Library</a></li>
					<li><a href="#">Groups</a></li>
				</ul>
			</nav>
			<a href="#" className="search">Search</a>
			<a href="#" className="user-profile-link"></a>
			<button className="dropdown-toggle">
				<span className="icon-bar"></span>
				<span className="icon-bar"></span>
				<span className="icon-bar"></span>
			</button>
			<button className="navbar-toggle">
				<span className="icon-bar"></span>
				<span className="icon-bar"></span>
				<span className="icon-bar"></span>
			</button>
		</header>;
	}
}
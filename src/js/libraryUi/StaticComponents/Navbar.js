'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:Navbar');

var React = require('react');

var Navbar = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<header id="navbar">
				<h1 className="navbar-brand"><a href="/">Zotero</a></h1>
				<nav className="navbar-nav">
					<h2 className="offscreen">Site navigation</h2>
				  <ul className="nav">
				  	<li><a href="#">Feed</a></li>
				  	<li className="active"><a href="#">Library</a></li>
				  	<li><a href="#">Groups</a></li>
				  </ul>
				</nav>
				<div className="navbar-right">
					Test
				</div>
				<button className="navbar-toggle">
					<span className="icon-bar"></span>
					<span className="icon-bar"></span>
					<span className="icon-bar"></span>
				</button>
			</header>
		);
	}
});

module.exports = Navbar;

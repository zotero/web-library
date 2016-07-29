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
				<h1>Zotero</h1>
				<nav>
					<h2 class="offscreen">Site navigation</h2>
				  <ul>
				  	<li><a href="#">Feed</a></li>
				  	<li><a href="#">Library</a></li>
				  	<li><a href="#">Groups</a></li>
				  </ul>
				</nav>
			</header>
		);
	}
});

module.exports = Navbar;

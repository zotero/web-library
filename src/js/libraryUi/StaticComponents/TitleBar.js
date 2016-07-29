'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:TitleBar');

var React = require('react');

var TitleBar = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<header id="title-bar">
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

module.exports = TitleBar;

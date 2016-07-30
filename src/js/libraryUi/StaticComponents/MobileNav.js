'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:MobileNav');

var React = require('react');

var MobileNav = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<nav id="mobile-nav">
				Mobile Nav
			</nav>
		);
	}
});

module.exports = MobileNav;

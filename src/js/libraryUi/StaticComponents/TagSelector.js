'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:TagSelector');

var React = require('react');

var TagSelector = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<nav id="tag-selector">
				<h3>Tags</h3>
			</nav>
		);
	}
});

module.exports = TagSelector;

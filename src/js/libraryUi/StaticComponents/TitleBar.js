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
			<div>
				TitleBar
			</div>
		);
	}
});

module.exports = TitleBar;

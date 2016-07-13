'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemsList');

var React = require('react');

var ItemsList = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<div>
				ItemsList
			</div>
		);
	}
});

module.exports = ItemsList;

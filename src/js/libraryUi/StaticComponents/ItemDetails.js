'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemDetails');

var React = require('react');

var ItemDetails = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<div>
				ItemDetails
			</div>
		);
	}
});

module.exports = ItemDetails;

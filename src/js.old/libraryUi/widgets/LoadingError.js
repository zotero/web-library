'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:loadingError');

var React = require('react');

var LoadingError = React.createClass({
	render: function() {
		return (
			<p hidden={!this.props.errorLoading}>
				There was an error loading your items. Please try again in a few minutes.
			</p>
		);
	}
});

module.exports = LoadingError;

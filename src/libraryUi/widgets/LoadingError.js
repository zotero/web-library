'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:loadingError');

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

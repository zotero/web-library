'use strict';

var log = require('../../../library/libZoteroJS/src/Log.js').Logger('zotero-web-library:loadingSpinner');

var React = require('react');

var LoadingSpinner = React.createClass({
	render: function() {
		var spinnerUrl = Zotero.config.baseWebsiteUrl + '/static/images/theme/broken-circle-spinner.gif';
		return (
			<div className="items-spinner" hidden={!this.props.loading}>
				<img className='spinner' src={spinnerUrl} />
			</div>
		);
	}
});

module.exports = LoadingSpinner;

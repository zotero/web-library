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
			<section id="item-details">
				<header>
					<h4 className="offscreen">Item title</h4>
				</header>
			</section>
		);
	}
});

module.exports = ItemDetails;

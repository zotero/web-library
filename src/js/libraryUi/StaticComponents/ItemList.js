'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemsList');

var React = require('react');
var ReactDOM = require('react-dom');

var ItemDetails = require('./ItemDetails.js');

var ItemsList = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<section id="item-list">
				<div id="item-list-container">
					<header className="touch-header">
						<h3>Collection title</h3>
						<div className="toolbar"></div>
					</header>
					<div>Item List</div>
				</div>
				<ItemDetails />
			</section>
		);
	}
});

module.exports = ItemsList;

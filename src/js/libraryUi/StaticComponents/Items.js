'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:Items');

var React = require('react');
var ReactDOM = require('react-dom');

var ItemList = require('./ItemList.js');
var ItemDetails = require('./ItemDetails.js');

var Items = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<section id="items">
				<div id="items-container">
					<header className="touch-header">
						<h3 className="hidden-mouse-md-up">Collection title</h3>
						<div className="toolbar"></div>
					</header>
					<table className="item-list-head">
						<thead>
							<tr>
								<th>Title</th>
								<th>Creator</th>
								<th>Year</th>
								<th>Date Modified</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
					</table>
					<div className="item-list-container">
						<ItemList/>
					</div>
				</div>
				<ItemDetails />
			</section>
		);
	}
});

module.exports = Items;

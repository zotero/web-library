'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:LibraryContainer');

var React = require('react');
var TitleBar = require('./TitleBar.js');
var CollectionTree = require('./CollectionTree.js');
var TagSelector = require('./TagSelector.js');
var ItemList = require('./ItemList.js');
var ItemDetails = require('./ItemDetails.js');

var LibraryContainer = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<div>
				<TitleBar />
				<CollectionTree />
				<TagSelector />
				<ItemList />
				<ItemDetails />
			</div>
		);
	}
});

module.exports = LibraryContainer;

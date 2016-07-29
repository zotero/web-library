'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:LibraryContainer');

var React = require('react');
var ReactDOM = require('react-dom');

var TitleBar = require('./TitleBar.js');
var CollectionTree = require('./CollectionTree.js');
var TagSelector = require('./TagSelector.js');
var ItemList = require('./ItemList.js');

Zotero.ui.widgets.StaticLibrary = {};

Zotero.ui.widgets.StaticLibrary.init = function(el){
	log.debug('StaticLibrary.init');
	ReactDOM.render(
		<LibraryContainer />,
		document.getElementById('staticlibrary')
	);
};

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
				<main>
					<section>
						<header id="sidebar">
							<h2 class="hidden-md hidden-lg">Library</h2>
							<CollectionTree />
							<TagSelector />
						</header>
						<ItemList />
					</section>
				</main>
			</div>
		);
	}
});

module.exports = LibraryContainer;

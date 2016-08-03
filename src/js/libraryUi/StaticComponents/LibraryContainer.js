'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:LibraryContainer');

var React = require('react');
var ReactDOM = require('react-dom');

var Navbar = require('./Navbar.js');
var CollectionTree = require('./CollectionTree.js');
var TagSelector = require('./TagSelector.js');
var ItemList = require('./ItemList.js');

Zotero.ui.widgets.StaticLibrary = {};

Zotero.ui.widgets.StaticLibrary.init = function(el){
	log.debug('StaticLibrary.init');
	ReactDOM.render(
		<LibraryContainer />,
		document.getElementById('library-container')
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
			<div id="library-root">
				<Navbar />
				<main>
					<section id="library">
						<header id="sidebar">
							<h2 className="offscreen">Web library</h2>
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

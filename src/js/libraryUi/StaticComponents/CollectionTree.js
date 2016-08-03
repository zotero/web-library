'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:CollectionTree');

var React = require('react');

var CollectionTree = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<nav id="collection-tree">
				<h3 className="offscreen">Library navigation</h3>
				<section>
					<h4>My library</h4>
					<ul>
						<li className="active"><a href="#">All documents</a></li>
						<li><a href="#">Collection 1</a></li>
						<li><a href="#">Collection 2</a></li>
						<li><a href="#">Collection 3</a></li>
					</ul>
				</section>
				<section>
					<h4>Group libraries</h4>
					<ul>
						<li><a href="#">Group library 1</a></li>
						<li><a href="#">Group library 2</a></li>
						<li><a href="#">Group library 3</a></li>
					</ul>
				</section>
			</nav>
		);
	}
});

module.exports = CollectionTree;

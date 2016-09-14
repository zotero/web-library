'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemList');

var React = require('react');

var ItemList = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<ul className="item-list">
				<li className="item">
					<div className="metadata">Design is a Job</div>
					<div className="metadata">Monteiro</div>
					<div className="metadata">2012</div>
					<div className="metadata">20/04/2016 12:54</div>
				</li>
				<li className="item">
					<div className="metadata">HTML5 for Web Designers</div>
					<div className="metadata">Keith and Andrew</div>
					<div className="metadata">2016</div>
					<div className="metadata">19/04/2016 10:36</div>
				</li>
				<li className="item">
					<div className="metadata">Managing Complex Augmented Reality Models</div>
					<div className="metadata">Schmalstieg et al.</div>
					<div className="metadata">2007</div>
					<div className="metadata">19/04/2016 10:38</div>
				</li>
				<li className="item">
					<div className="metadata">Mobile First</div>
					<div className="metadata">Wroblewski</div>
					<div className="metadata">2012</div>
					<div className="metadata">19/04/2016 10:44</div>
				</li>
				<li className="item">
					<div className="metadata">Responsive Web Design</div>
					<div className="metadata">Marcott</div>
					<div className="metadata">2010</div>
					<div className="metadata">20/04/2016 16:05</div>
				</li>
				<li className="item">
					<div className="metadata">Sass for Web Designers</div>
					<div className="metadata">Cederholm</div>
					<div className="metadata">2013</div>
					<div className="metadata">17/04/2016 19:20</div>
				</li>
			</ul>
		);
	}
});

module.exports = ItemList;
'use strict';

var log = require('libzotero/lib/Log').Logger('zotero-web-library:ItemList');

var React = require('react');
var ReactDOM = require('react-dom');

var ItemList = React.createClass({
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function() {
		return {};
	},
	render: function() {
		return (
			<div className="item-list-wrap">
				<table className="item-list-head hidden-touch hidden-sm-down">
					<thead>
						<tr>
							<th>Title</th>
							<th>Creator</th>
							<th>Year</th>
							<th className="hidden-touch hidden-sm-down">Date Modified</th>
							<th className="hidden-touch hidden-sm-down"></th>
							<th className="hidden-touch hidden-sm-down"></th>
						</tr>
					</thead>
				</table>
				<div className="item-list-body">
					<ul className="item-list">
						<li className="item clearfix">
							<div className="metadata">Design is a Job</div>
							<div className="metadata author">Monteiro</div>
							<div className="metadata year">2012</div>
							<div className="metadata hidden-touch hidden-sm-down">20/04/2016 12:54</div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
						</li>
						<li className="item">
							<div className="metadata">HTML5 for Web Designers</div>
							<div className="metadata author">Keith and Andrew</div>
							<div className="metadata year">2016</div>
							<div className="metadata hidden-touch hidden-sm-down">19/04/2016 10:36</div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
						</li>
						<li className="item">
							<div className="metadata">Managing Complex Augmented Reality Models</div>
							<div className="metadata author">Schmalstieg et al.</div>
							<div className="metadata year">2007</div>
							<div className="metadata hidden-touch hidden-sm-down">19/04/2016 10:38</div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
						</li>
						<li className="item">
							<div className="metadata">Mobile First</div>
							<div className="metadata author">Wroblewski</div>
							<div className="metadata year">2012</div>
							<div className="metadata hidden-touch hidden-sm-down">19/04/2016 10:44</div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
						</li>
						<li className="item active">
							<div className="metadata">Responsive Web Design</div>
							<div className="metadata author">Marcott</div>
							<div className="metadata year">2010</div>
							<div className="metadata hidden-touch hidden-sm-down">20/04/2016 16:05</div>
							<div className="metadata hidden-touch hidden-sm-down">2</div>
							<div className="metadata hidden-touch hidden-sm-down">2</div>
						</li>
						<li className="item">
							<div className="metadata">Sass for Web Designers</div>
							<div className="metadata author">Cederholm</div>
							<div className="metadata year">2013</div>
							<div className="metadata hidden-touch hidden-sm-down">17/04/2016 19:20</div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
							<div className="metadata hidden-touch hidden-sm-down"></div>
						</li>
					</ul>
				</div>
			</div>
		);
	}
});

module.exports = ItemList;
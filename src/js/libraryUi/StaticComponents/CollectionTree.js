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

				{/* Level 1 */}
				<section className="level">
					<h4>My library</h4>
					<ul className="nav">
						<li><a href="#">All documents</a></li>
						<li className=""><a href="#">Level 1</a>

							{/* Level 2 */}
							<section className="level">
								<h5 className="hidden-mouse-md-up">Level 2 title</h5>
								<ul className="nav">
									<li className=""><a href="#">Level 2</a>

										{/* Level 3 */}
										<section className="level">
											<h6 className="hidden-mouse-md-up">Level 3 title</h6>
											<ul className="nav">
												<li className="active"><a href="#">Level 3</a></li>
												<li><a href="#">Level 3</a></li>
												<li><a href="#">Level 3</a></li>
											</ul>
										</section>
									</li>
									<li><a href="#">Level 2</a></li>
									<li><a href="#">Level 2</a></li>
								</ul>
							</section>
						</li>
						<li><a href="#">Level 1</a></li>
						<li><a href="#">Level 1</a></li>
					</ul>
				</section>
				<section>
					<h4>Group libraries</h4>
					<ul className="nav">
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

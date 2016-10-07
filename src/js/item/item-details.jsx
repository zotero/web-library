'use strict';

import React from 'react';

export default class ItemDetails extends React.Component {
	render() {
		return (
			<section className='item-details'>

				{/* Future panel component */}
				<section className="panel">
					<header className="panel-header">
						<h4 className='offscreen'>Item title</h4>

						{/* Future tabs component */}
						<nav>

							{/* Props: justified, compact */}
							<ul className="tabs compact">
								<li className='active'><a href="#">Info</a></li>
								<li><a href="#">Notes</a></li>
								<li><a href="#">Tags</a></li>
								<li><a href="#">Attachments</a></li>
								<li><a href="#">Related</a></li>
							</ul>
						</nav>
					</header>
					<div className="panel-body">

						{/* Description list */}
						<dl className="dl-horizontal">
							<dt>Item Type</dt>
							<dd>Book</dd>
							<dt>Title</dt>
							<dd>Responsive Web Design</dd>
							<dt>Author</dt>
							<dd>Marcott, Ethan</dd>
							<dt>Editor</dt>
							<dd>Brown, Mandy</dd>
							<dt>Series</dt>
							<dd>A Book Apart</dd>
							<dt>Series Number</dt>
							<dd>4</dd>
							<dt>Volume</dt>
							<dd></dd>
							<dt># of Volume</dt>
							<dd></dd>
							<dt>Edition</dt>
							<dd></dd>
							<dt>Place</dt>
							<dd></dd>
							<dt>Publisher</dt>
							<dd></dd>
							<dt>Date</dt>
							<dd></dd>
							<dt># of Pages</dt>
							<dd></dd>
							<dt>Language</dt>
							<dd></dd>
							<dt>ISBN</dt>
							<dd>978-0-9844425-7-7</dd>
							<dt>Short Title</dt>
							<dd></dd>
							<dt>URL</dt>
							<dd></dd>
							<dt>Accessed</dt>
							<dd></dd>
							<dt>Archive</dt>
							<dd></dd>
							<dt>Loc. in Archive</dt>
							<dd></dd>
							<dt>Library Catalog</dt>
							<dd></dd>
							<dt>Call Number:</dt>
							<dd></dd>
							<dt>Rights</dt>
							<dd></dd>
							<dt>Extra</dt>
							<dd></dd>
							<dt>Date Added</dt>
							<dd>29/09/2016, 18:34:31</dd>
							<dt>Modified</dt>
							<dd>29/09/2016, 18:51:32</dd>
						</dl>
					</div>
				</section>
			</section>
		);
	}
}
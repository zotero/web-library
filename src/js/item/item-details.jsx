'use strict';

import React from 'react';

export default class ItemDetails extends React.Component {
	render() {
		return (
			<section className='item-details'>

				{/* Future panel component */}
				<section className='panel'>
					<header className='panel-header'>
						<h4 className='offscreen'>Item title</h4>

						{/* Future tabs component */}
						<nav>

							{/* Props: justified, compact */}
							<ul className='tabs compact'>
								<li className='active'><a href='#'>Info</a></li>
								<li><a href='#'>Notes</a></li>
								<li><a href='#'>Tags</a></li>
								<li><a href='#'>Attachments</a></li>
								<li><a href='#'>Related</a></li>
							</ul>
						</nav>
					</header>
					<div className='panel-body'>
						<div className='tab-content'>
							<div className='tab-pane active'>

								{/* Description list */}
								<dl className='dl-horizontal'>
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
									<dt className='empty'>Volume</dt>
									<dd className='empty'></dd>
									<dt className='empty'># of Volume</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Edition</dt>
									<dd className='empty'></dd>
									<dt>Place</dt>
									<dd>New York, New York</dd>
									<dt>Publisher</dt>
									<dd>Jeffrey Zeldman</dd>
									<dt>Date</dt>
									<dd>2011</dd>
									<dt># of Pages</dt>
									<dd>153</dd>
									<dt>Language</dt>
									<dd>English</dd>
									<dt>ISBN</dt>
									<dd>978-0-9844425-7-7</dd>
									<dt className='empty'>Short Title</dt>
									<dd className='empty'></dd>
									<dt className='empty'>URL</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Accessed</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Archive</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Loc. in Archive</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Library Catalog</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Call Number:</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Rights</dt>
									<dd className='empty'></dd>
									<dt className='empty'>Extra</dt>
									<dd className='empty'></dd>
									<dt>Date Added</dt>
									<dd>29/09/2016, 18:34:31</dd>
									<dt>Modified</dt>
									<dd>29/09/2016, 18:51:32</dd>
								</dl>
							</div>
						</div>
					</div>
				</section>
			</section>
		);
	}
}
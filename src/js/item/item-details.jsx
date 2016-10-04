'use strict';

import React from 'react';

export default class ItemDetails extends React.Component {
	render() {
		return (
			<section className='item-details'>
				<header>
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
			</section>
		);
	}
}
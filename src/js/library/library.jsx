'use strict';

import React from 'react';
import Navbar from '../app/navbar';
import CollectionTreeContainer from '../collection/collection-tree-container';
import TagSelector from '../tag/tag-selector';
import ItemsListContainer from '../item/items-list-container';
import ItemDetails from '../item/item-details';

export default class Library extends React.Component {
	render() {
		return (
			<div>
				<Navbar />
				<main>
					<section className="library">
						<header className="touch-header hidden-sm-up">Mobile Header</header>
						<header className="sidebar">
							<h2 className="offscreen">Web library</h2>
							<CollectionTreeContainer />
							<TagSelector />
						</header>
						<section className="items">
							<div className="items-container">
								<header className="touch-header hidden-xs-down">
									<h3 className="hidden-mouse-md-up">Collection title</h3>
									<div className="toolbar hidden-touch hidden-sm-down">Toolbar</div>
								</header>
								<ItemsListContainer />
							</div>
							<ItemDetails/>
						</section>
					</section>
				</main>
			</div>
		);
	}
}
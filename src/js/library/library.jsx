'use strict';

import React from 'react';
import Navbar from '../app/navbar';
import CollectionTreeContainer from '../collection/collection-tree-container';
import TagSelector from '../app/tag-selector';
import ItemsListContainer from '../item/items-list-container';

export default class Library extends React.Component {
	render() {
		return (
			<div>
				<Navbar />
				<main>
					<section className="library">
						<header className="sidebar">
							<h2 className="offscreen">Web library</h2>
							<CollectionTreeContainer />
							<TagSelector />
						</header>
						<section className="items-container">
							<header className="touch-header">
								<h3 className="hidden-mouse-md-up">Collection title</h3>
								<div className="toolbar">Toolbar</div>
							</header>
							<ItemsListContainer />
						</section>
					</section>
				</main>
			</div>
		);
	}
}
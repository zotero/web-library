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
					<div>VIEW: { this.props.view }</div>
					<section className={ `library ${ this.props.view === 'library' ? 'active' : '' }` }>
						<header className="touch-header hidden-sm-up">Mobile Header</header>
						<header className="sidebar">
							<h2 className="offscreen">Web library</h2>
							<CollectionTreeContainer />
							<TagSelector />
						</header>
						<section className={ `items ${ this.props.view === 'items' ? 'active' : '' }` }>
							<div className="items-container">
								<header className="touch-header hidden-xs-down">
									<h3 className="hidden-mouse-md-up">Collection title</h3>
									<div className="toolbar hidden-touch hidden-sm-down">Toolbar</div>
								</header>
								<ItemsListContainer />
							</div>
							<section className={ `item-details ${this.props.view === 'item-details' ? 'active' : ''}` }>
								<ItemDetails/>
							</section>
						</section>
					</section>
				</main>
			</div>
		);
	}
}

Library.propTypes = {
	view: React.PropTypes.string
};
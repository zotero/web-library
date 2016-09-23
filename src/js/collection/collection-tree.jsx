'use strict';

import React from 'react';
import Spinner from '../app/spinner.jsx';

export default class CollectionTree extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collections: []
		};
	}

	componentWillReceiveProps(nextProps) {
		let rootCollections = [];
		nextProps.collections.forEach(collection => {
				if(collection.nestingDepth == 1) {
					rootCollections.push(collection);	
				}
			});

		this.setState({
			collections: rootCollections
		});
	}

	renderCollections(collections, level) {
		return (
			<section className={ `level level-${level}` }>
				<ul className="nav">
					{ collections.map(collection => {
						return (
							<li className="" key={collection.key}>
								<a href="#" onClick={ () => this.props.onCollectionSelected(collection.key) }>
									{ collection.apiObj.data.name }
								</a>
								{ collection.children.length ? this.renderCollections(collection.children, level + 1) : null }
							</li>
						);
					}) }
				</ul>
			</section>
		);
	}

	render() {
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<nav className="collection-tree">
					<div className="level-1">
						<header className="touch-header hidden-mouse-md-up">
							<h3>Library</h3>
						</header>

						<section>
							<h4>My library</h4>
							{ this.renderCollections(this.state.collections, 1)}
						</section>
					</div>
				</nav>
			);
		}
	}
}

CollectionTree.propTypes = {
	isFetching: React.PropTypes.bool.isRequired,
	onCollectionSelected: React.PropTypes.func.isRequired,
	collections: React.PropTypes.arrayOf(React.PropTypes.shape({
		name: React.PropTypes.string,
		nestingDepth: React.PropTypes.integer,
		children: React.PropTypes.array
	})).isRequired
};
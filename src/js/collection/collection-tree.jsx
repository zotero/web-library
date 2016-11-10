'use strict';

import React from 'react';
import Spinner from '../app/spinner';

export default class CollectionTree extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collections: this.props.collections.filter(c => c.nestingDepth === 1)
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			collections: nextProps.collections.filter(c => c.nestingDepth === 1)
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
						<header className="touch-header hidden-mouse-md-up hidden-xs-down">
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
	isFetching: React.PropTypes.bool,
	onCollectionSelected: React.PropTypes.func.isRequired,
	collections: React.PropTypes.arrayOf(React.PropTypes.shape({
		key: React.PropTypes.string.isRequired,
		nestingDepth: React.PropTypes.integer,
		children: React.PropTypes.array,
		apiObj: React.PropTypes.shape({
			data: React.PropTypes.shape({
				name: React.PropTypes.string
			})
		})
	})).isRequired
};

CollectionTree.defaultProps = {
	isFetching: false,
	onCollectionSelected: () => null
};
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
			<ul className={ `nav level level-${level}` }>
				{ collections.map(collection => {
					return (
						<li key={collection.key} className={ collection.key === this.props.selected ? 'open' : '' }>
							<a href="#" onClick={ () => this.props.onCollectionSelected(collection.key) }>
								{ collection.apiObj.data.name }
							</a>
							{ collection.children.length ? this.renderCollections(collection.children, level + 1) : null }
						</li>
					);
				}) }
			</ul>
		);
	}

	render() {
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			return (
				<nav className="collection-tree">
					<header className="touch-header hidden-mouse-md-up hidden-xs-down">
						<h3>Library</h3>
					</header>

					<section>
						<h4>My Library</h4>
						{ this.renderCollections(this.state.collections, 1)}
					</section>

					<section>
						<h4>Group Libraries</h4>
						{/* List of group libraries */}
					</section>
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
	})).isRequired,
	selected: React.PropTypes.string
};

CollectionTree.defaultProps = {
	isFetching: false,
	onCollectionSelected: () => null
};
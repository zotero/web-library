'use strict';

import React from 'react';
import { Link } from 'react-router';
import Spinner from '../app/spinner';

export default class CollectionTree extends React.Component {
	constructor(props) {
		super(props);
		//@TODO: deduplicate and use single loop
		this.state = {
			collections: this.props.collections.filter(c => c.nestingDepth === 1),
			open: this.props.collections.filter(c => !!c.isOpen)
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			collections: nextProps.collections.filter(c => c.nestingDepth === 1),
			open: nextProps.collections.filter(c => !!c.isOpen)
		});
	}

	renderCollections(collections, level) {
		let topLevelKeys = collections.map(col => col.key);
		let hasOpen = topLevelKeys.some(topLevelKey => this.state.open.includes(topLevelKey));
		return (
			<div className={ `level level-${level} ${hasOpen ? 'has-open' : ''}` }>
				<ul className="nav">
					{ collections.map(collection => {
						let twistyButton = (
							<button
								type="button"
								className="twisty"
								onClick={ () => this.props.onCollectionOpened(collection.key) }
							/>
						);
						return (
							<li
								key={collection.key}
								className={ `${collection.isOpen ? 'open' : ''} ${collection.isSelected ? 'selected' : '' }` }
							>
								<div className="item-container">
									<div className="twisty-container">
										{/* Button component */}
										{ collection.hasChildren ? twistyButton : '' }
									</div>
									<a onClick={ () => this.props.onCollectionSelected(collection.key) }>
										{ collection.apiObj.data.name }
									</a>
								</div>
								{ collection.children.length ? this.renderCollections(collection.children, level + 1) : null }
							</li>
						);
					}) }
				</ul>
			</div>
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

					<div className="scroll-container">
						<section>
							<h4>My Library</h4>
							{ this.renderCollections(this.state.collections, 1)}
						</section>

						<section>
							<h4>Group Libraries</h4>
							{/* List of group libraries */}
						</section>
					</div>
				</nav>
			);
		}
	}
}

CollectionTree.propTypes = {
	isFetching: React.PropTypes.bool,
	onCollectionOpened: React.PropTypes.func,
	onCollectionSelected: React.PropTypes.func,
	collections: React.PropTypes.arrayOf(React.PropTypes.shape({
		key: React.PropTypes.string.isRequired,
		nestingDepth: React.PropTypes.integer,
		hasChildren: React.PropTypes.bool,
		children: React.PropTypes.array,
		apiObj: React.PropTypes.shape({
			data: React.PropTypes.shape({
				name: React.PropTypes.string
			})
		}),
		isOpen: React.PropTypes.bool,
		isSelected: React.PropTypes.selected
	})).isRequired
};

CollectionTree.defaultProps = {
	isFetching: false,
	onCollectionOpened: () => null,
	onCollectionSelected: () => null
};
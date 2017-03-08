'use strict';

import React from 'react';
import InjectableComponentsEnhance from '../enhancers/injectable-components-enhancer';

function testRecursive(collections, test) {
	if(collections.some(test)) {
		return true;
	} else {
		for(let collection of collections) {
			if('children' in collection) {
				if(testRecursive(collection.children, test)) {
					return true;
				}
			}
		}
	}
	return false;
}

class CollectionTree extends React.Component {
	constructor(props) {
		super(props);
		//@TODO: deduplicate and use single loop
		this.state = {
			collections: this.props.collections.filter(c => c.nestingDepth === 1),
			selectedCollection: this.props.collections.find(c => !!c.isSelected)
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			collections: nextProps.collections.filter(c => c.nestingDepth === 1),
			selectedCollection: nextProps.collections.find(c => !!c.isSelected)
		});
	}

	collectionSelectedHandler(key, ev) {
		ev && ev.preventDefault();
		this.props.onCollectionSelected(key, ev);
	}

	collectionOpenenedHandler(key, ev) {
		ev && ev.stopPropagation();
		this.props.onCollectionOpened(key, ev);
	}

	collectionKeyboardHandler(key, ev) {
		if(ev && (ev.key === 'Enter' || ev.key === ' ')) {
			ev.stopPropagation();
			this.props.onCollectionSelected(key, ev);
		}
	}

	renderCollections(collections, level) {
		let hasOpen = testRecursive(collections, col => this.state.selectedCollection == col);
		let hasOpenLastLevel = collections.some(col => {
			return col.isSelected && !col.hasChildren;
		});
		let Icon = this.props.components['Icon'];

		return (
			<div className={ `level level-${level} ${hasOpen ? 'has-open' : ''} ${hasOpenLastLevel ? 'level-last' : ''}` }>
				<ul className="nav" role="group">
					{ collections.map(collection => {
						let twistyButton = (
							<button
								type="button"
								className="twisty"
								onClick={ ev => this.collectionOpenenedHandler(collection.key, ev) }
								onKeyPress={ ev => ev.stopPropagation() }
							/>
						);
						return (
							<li
								key={collection.key}
								className={ `${collection.isOpen ? 'open' : ''} ${collection.isSelected ? 'selected' : '' }` }
							>
								<div
									className="item-container"
									onClick={ ev => this.collectionSelectedHandler(collection.key, ev) }
									onKeyPress={ ev => this.collectionKeyboardHandler(collection.key, ev) }
									role="treeitem"
									aria-expanded={ collection.isOpen }
									tabIndex="0" >
									<div className="twisty-container">
										{/* Button component */}
										{ collection.hasChildren ? twistyButton : '' }
									</div>
									<Icon type={ `28/folder${collection.children.length ? 's' : ''}` } className="touch" width="28" height="28"/>
									<Icon type="16/folder" className="mouse" width="16" height="16"/>
									<a>
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
		let Spinner = this.props.components['Spinner'];
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			let isRootActive =
			!this.state.selectedCollection
			|| (this.state.selectedCollection
				&& this.state.selectedCollection.nestingDepth === 1
				&& !this.state.selectedCollection.hasChildren
			);
			return (
				<nav className="collection-tree">
					<header className="touch-header hidden-mouse-md-up hidden-xs-down">
						<h3>Library</h3>
					</header>

					<div className={ `level-root ${isRootActive ? 'active' : ''}` }>
						<div className="scroll-container" role="tree">
							<section>
								<h4>My Library</h4>
								{ this.renderCollections(this.state.collections, 1)}
							</section>

							<section>
								<h4>Group Libraries</h4>
								{/* List of group libraries */}
							</section>
						</div>
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

export default InjectableComponentsEnhance(CollectionTree);
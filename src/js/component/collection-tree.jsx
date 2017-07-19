'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const InjectableComponentsEnhance = require('../enhancers/injectable-components-enhancer');

class CollectionTree extends React.Component {
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

	collectionsFromKeys(collections) {
		return collections.map(
			collectionKey => this.props.collections.find(
				collection => collectionKey === collection.key
			)
		);
	}

	testRecursive(collections, test) {
		if(collections.some(test)) {
			return true;
		} else {
			for(let collection of collections) {
				const childrenCollections = this.collectionsFromKeys(collection.children);
				if(this.testRecursive(childrenCollections, test)) {
					return true;
				}
			}
		}
		return false;
	}

	renderCollections(collections, level) {
		let hasOpen = this.testRecursive(collections, col => col.isSelected);
		let hasOpenLastLevel = collections.some(col => col.isSelected && !col.hasChildren);
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
										{ collection.name }
									</a>
								</div>
								{ collection.children.length ? this.renderCollections(this.collectionsFromKeys(collection.children), level + 1) : null }
							</li>
						);
					}) }
				</ul>
			</div>
		);
	}

	render() {
		const Spinner = this.props.components['Spinner'];
		const selectedCollection = this.props.collections.find(c => c.isSelected) || null;
		const topLevelCollections = this.props.collections.filter(c => c.parentCollection === false);
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			let isRootActive = !selectedCollection || (
				selectedCollection && 
				selectedCollection.parentCollection === false &&
				!selectedCollection.hasChildren
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
								{ this.renderCollections(topLevelCollections, 1)}
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
	isFetching: PropTypes.bool,
	onCollectionOpened: PropTypes.func,
	onCollectionSelected: PropTypes.func,
	collections: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
			name: PropTypes.string,
			// not from the API, needs to be pre-calculated
			hasChildren: PropTypes.bool,
			children: PropTypes.array,
			isOpen: PropTypes.bool,
			isSelected: PropTypes.bool
		}
	)).isRequired
};

CollectionTree.defaultProps = {
	isFetching: false,
	onCollectionOpened: () => null,
	onCollectionSelected: () => null
};

module.exports = InjectableComponentsEnhance(CollectionTree);
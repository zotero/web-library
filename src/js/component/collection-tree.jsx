'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const memoize = require('memoize-one');
const cx = require('classnames');
const Icon = require('./ui/icon');
const Spinner = require('./ui/spinner');

class CollectionTree extends React.Component {
	state = {
		opened: []
	}

	handleSelect(key, ev) {
		ev && ev.preventDefault();
		this.props.onCollectionSelected(key, ev);
	}

	handleOpenToggle(key, ev) {
		ev && ev.stopPropagation();
		const { opened } = this.state;
		opened.includes(key) ?
			this.setState({ opened: opened.filter(k => k !== key) }) :
			this.setState({ opened: [...opened, key ] });
		this.props.onCollectionOpened();
	}

	handleKeyPress(key, ev) {
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
				const childrenCollections = this.collectionsFromKeys(this.childMap[collection.key] || []);
				if(this.testRecursive(childrenCollections, test)) {
					return true;
				}
			}
		}
		return false;
	}

	makeChildMap = memoize(collections => collections.reduce((aggr, col) => {
		if(!col.parentCollection) {
			return aggr;
		}
		if(!(col.parentCollection in aggr)) {
			aggr[col.parentCollection] = [];
		}
		aggr[col.parentCollection].push(col.key);
		return aggr;
	}, {}));

	makeDerivedData = memoize((collections, path, opened) => {
		return collections.reduce((aggr, c) => {
			const derivedData = {
				isSelected: false,
				isOpen: false
			};

			let index = path.indexOf(c.key);
			derivedData['isSelected'] = index >= 0 && index === path.length - 1;
			if(opened.includes(c.key)) {
				derivedData['isOpen'] = true;
			} else {
				if(index >= 0 && index < path.length - 1) {
					derivedData['isOpen'] = true;
				} else if(index !== -1) {
					derivedData['isOpen'] = false;
				}
			}

			aggr[c.key] = derivedData
			return aggr;
		}, {});
	});

	get childMap() {
		const { collections } = this.props;
		return this.makeChildMap(collections);
	}

	get derivedData() {
		const { collections, path } = this.props;
		return this.makeDerivedData(collections, path, this.state.opened);
	}

	renderCollections(collections, level) {
		const { childMap, derivedData } = this;
		const hasOpen = this.testRecursive(collections, col => col.isSelected);
		const hasOpenLastLevel = collections.some(
			col => col.isSelected && col.key in childMap
		);

		return (
			<div className={ `level level-${level} ${hasOpen ? 'has-open' : ''} ${hasOpenLastLevel ? 'level-last' : ''}` }>
				<ul className="nav" role="group">
					{
						level === 1 && (
							<li
								className={ cx({
									'all-documents': true,
									'selected': this.props.isTopLevel
								})}
								>
								<div
									className="item-container"
									onClick={ ev => this.handleSelect(null, ev) }
									onKeyPress={ ev => this.handleKeyPress(null, ev) }
									role="treeitem"
									tabIndex="0"
								>
									<div className="twisty-container" />
									<Icon type="28/document" className="touch" width="28" height="28"/>
									<Icon type="16/document" className="mouse" width="16" height="16"/>
									<a>
										All Documents
									</a>
								</div>
							</li>
						)
					}
					{ collections.map(collection => {
						let twistyButton = (
							<button
								type="button"
								className="twisty"
								onClick={ ev => this.handleOpenToggle(collection.key, ev) }
								onKeyPress={ ev => ev.stopPropagation() }
							/>
						);
						return (
							<li
								key={collection.key}
								className={ cx({
									'open': derivedData[collection.key].isOpen,
									'selected': derivedData[collection.key].isSelected,
									'collection': true,
								})}
							>
								<div
									className="item-container"
									onClick={ ev => this.handleSelect(collection.key, ev) }
									onKeyPress={ ev => this.handleKeyPress(collection.key, ev) }
									role="treeitem"
									aria-expanded={ derivedData[collection.key].isOpen }
									tabIndex="0" >
									<div className="twisty-container">
										{/* Button component */}
										{ collection.key in childMap ? twistyButton : '' }
									</div>
									<Icon type={ `28/folder${(collection.key in childMap) ? 's' : ''}` } className="touch" width="28" height="28"/>
									<Icon type="16/folder" className="mouse" width="16" height="16"/>
									<a>
										{ collection.name }
									</a>
								</div>
								{ collection.key in childMap ?
									this.renderCollections(this.collectionsFromKeys(childMap[collection.key]), level + 1) :
									null
								}
							</li>
						);
					}) }
				</ul>
			</div>
		);
	}

	render() {
		const { collections } = this.props;
		const selectedCollection = Object.keys(this.derivedData)
			.find((collectionKey) => this.derivedData[collectionKey].isSelected) || null;
		const topLevelCollections = collections
			.filter(c => c.parentCollection === false);
		if(this.props.isFetching) {
			return <Spinner />;
		} else {
			let isRootActive = !selectedCollection || (
				selectedCollection &&
				selectedCollection.parentCollection === false &&
				!(selectedCollection.key in this.childMap)
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
	path: PropTypes.array,
	collections: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
			name: PropTypes.string,
		}
	)).isRequired
};

CollectionTree.defaultProps = {
	collections: [],
	isFetching: false,
	onCollectionOpened: () => null,
	onCollectionSelected: () => null,
	path: [],
};

module.exports = CollectionTree;

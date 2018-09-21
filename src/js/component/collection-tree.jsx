'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const memoize = require('memoize-one');
const cx = require('classnames');
const Icon = require('./ui/icon');
const Button = require('./ui/button');
const Spinner = require('./ui/spinner');
const Input = require('./form/input');
const Node = require('./collection-tree/node');
const ActionsDropdown = require('./collection-tree/actions-dropdown');
const DropdownItem = require('reactstrap/lib/DropdownItem').default;
const { ViewportContext } = require('../context');
const deepEqual = require('deep-equal');

class CollectionTree extends React.Component {
	state = {
		isAddingCollection: false,
		isAddingCollectionBusy: false,
		opened: [],
		renaming: null,
	}

	componentDidUpdate({ updating: wasUpdating }) {
		if(!deepEqual(this.props.updating, wasUpdating)) {
			let updatedCollectionKey = wasUpdating.find(cKey => !this.props.updating.includes(cKey));
			if(updatedCollectionKey &&  updatedCollectionKey === this.state.renaming) {
				this.setState({ renaming: null });
			}
		}
	}

	handleSelect(pathData, ev) {
		ev && ev.preventDefault();
		this.props.onSelect(pathData);
	}

	handleOpenToggle(key, ev) {
		ev && ev.stopPropagation();
		const { opened } = this.state;
		opened.includes(key) ?
			this.setState({ opened: opened.filter(k => k !== key) }) :
			this.setState({ opened: [...opened, key ] });
		this.props.onCollectionOpened();
	}

	handleKeyPress(pathData, ev) {
		if(ev && (ev.key === 'Enter' || ev.key === ' ')) {
			ev.stopPropagation();
			this.props.onSelect(pathData, ev);
		}
	}

	handleCollectionAdd() {
		this.setState({ isAddingCollection: true });
	}

	async handleCollectionAddCommit(name) {
		this.setState({ isAddingCollectionBusy: true });
		await this.props.onCollectionAdd(name);
		this.setState({
			isAddingCollection: false,
			isAddingCollectionBusy: false
		});
	}

	handleCollectionAddCancel() {
		this.setState({ isAddingCollection: false });
	}

	handleRename(collectionKey) {
		this.setState({ renaming: collectionKey});
	}

	async handleCollectionRenameCommit(collectionKey, name) {
		await this.props.onCollectionUpdate(collectionKey, { name });
	}

	handleCollectionRenameCancel() {
		this.setState({ renaming: null });
	}

	async handleDelete(collection) {
		await this.props.onCollectionDelete(collection);
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

	renderCollections(collections, level, library, parentCollection = null) {
		const { childMap, derivedData } = this;
		const { itemsSource, libraryKey, userLibraryKey } = this.props;

		const hasOpen = this.testRecursive(
			collections, col => derivedData[col.key].isSelected
		);
		const hasOpenLastLevel = collections.length === 0;

		return (
			<div className={ cx('level', `level-${level}`, {
				'has-open': hasOpen, 'level-last': hasOpenLastLevel
			}) }>
				<ul className="nav" role="group">
					{
						level === 1 && (
							<Node
								className={ cx({
									'all-documents': true,
									'selected': libraryKey === userLibraryKey && itemsSource === 'top'
								})}
								onClick={ this.handleSelect.bind(this, { library: userLibraryKey }) }
								onKeyPress={ this.handleKeyPress.bind(this, { library: userLibraryKey }) }
								dndTarget={ { 'targetType': 'all-documents' } }
							>
								<Icon type="28/document" className="touch" width="28" height="28" />
								<Icon type="16/document" className="mouse" width="16" height="16" />
								<a>All Documents</a>
							</Node>
						)
					}
					{ collections.map(collection => (
						<Node
							key={ collection.key }
							className={ cx({
								'open': derivedData[collection.key].isOpen,
								'selected': derivedData[collection.key].isSelected,
								'collection': true,
							})}
							subtree={
								this.renderCollections(
									this.collectionsFromKeys(childMap[collection.key] || []),
									level + 1,
									library,
									collection
								)
							}
							onOpen={ this.handleOpenToggle.bind(this, collection.key) }
							onClick={ this.handleSelect.bind(this, {
								library: userLibraryKey, collection: collection.key })
							}
							onKeyPress={ this.handleKeyPress.bind(this, {
								library: userLibraryKey, collection: collection.key })
							}
							label={ collection.name }
							isOpen={ derivedData[collection.key].isOpen }
							icon="folder"
							dndTarget={ { 'targetType': 'collection', collectionKey: collection.key } }
						>
								<Icon type="28/folder" className="touch" width="28" height="28" />
								<Icon type="16/folder" className="mouse" width="16" height="16" />
								{
									this.state.renaming === collection.key ?
									<Input autoFocus
										isBusy={ this.props.updating.includes(collection.key) }
										onBlur={ () => true /* cancel on blur */ }
										onCancel={ this.handleCollectionRenameCancel.bind(this) }
										onCommit={ this.handleCollectionRenameCommit.bind(this, collection.key) }
										value={ collection.name }
									/> :
									<React.Fragment>
										<a>{ collection.name }</a>
										<ActionsDropdown>
											<DropdownItem onClick={ this.handleRename.bind(this, collection.key) }>
												Rename
											</DropdownItem>
											<DropdownItem onClick={ this.handleDelete.bind(this, collection) }>
												Delete
											</DropdownItem>
										</ActionsDropdown>
									</React.Fragment>
								}

						</Node>
					)) }
					{
						this.state.isAddingCollection && level === 1 && (
							<Node
								className={ cx({ 'new-collection': true })}
							>
								<Icon type="28/folder" className="touch" width="28" height="28" />
								<Icon type="16/folder" className="mouse" width="16" height="16" />
								<Input autoFocus
									isBusy={ this.state.isAddingCollectionBusy }
									onCommit={ this.handleCollectionAddCommit.bind(this) }
									onCancel={ this.handleCollectionAddCancel.bind(this) }
									onBlur={ () => true /* cancel on blur */ }
								/>
							</Node>
						)
					}
					{
						level === 1 && (
							<Node
								className={ cx({
									'trash': true,
									'selected': itemsSource === 'trash'
								})}
								onClick={ this.handleSelect.bind(this, { library: userLibraryKey, trash: true }) }
								onKeyPress={ this.handleKeyPress.bind(this, { library: userLibraryKey, trash: true }) }
								dndTarget={ { 'targetType': 'trash' } }
							>
								<Icon type="28/trash" className="touch" width="28" height="28" />
								<Icon type="16/trash" className="mouse" width="16" height="16" />
								<a>Trash</a>
							</Node>
						)
					}
					<ViewportContext.Consumer>
						{ viewport => (
							viewport.xxs && itemsSource === 'collection' && parentCollection && (
								<Node
									onClick={ this.handleSelect.bind(this, {
										library: userLibraryKey,
										view: 'item-list'
									}) }
									onKeyPress={ this.handleKeyPress.bind(this, {
										library: userLibraryKey,
										view: 'item-list'
									}) }
								>
									<Icon type="28/document" className="touch" width="28" height="28" />
									<Icon type="16/document" className="mouse" width="16" height="16" />
									<a>Items</a>
								</Node>
							)
						)}
					</ViewportContext.Consumer>
				</ul>
			</div>
		);
	}

	renderGroups(level = 1) {
		const { groups } = this.props;

		return (
			<div className={ cx('level', `level-${level}`) }>
				<ul className="nav" role="group">
					{
						groups.map(group => (
							<Node
								onClick={ this.handleSelect.bind(this, {'library': `g${group.id}`}) }
								onKeyPress={ this.handleKeyPress.bind(this, {'library': `g${group.id}`}) }
								key={ group.id }
							>
								<Icon type="28/folder" className="touch" width="28" height="28" />
								<Icon type="16/folder" className="mouse" width="16" height="16" />
								<a>{ group.name }</a>
							</Node>
						))
					}
				</ul>
			</div>
		);
	}

	render() {
		const { collections, userLibraryKey } = this.props;
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
								<div className="desktop-header">
									<h4>My Library</h4>
									<Button onClick={ this.handleCollectionAdd.bind(this) } >
										<Icon type={ '20/add-collection' } width="20" height="20" />
									</Button>
								</div>
								{ this.renderCollections(topLevelCollections, 1, userLibraryKey)}
							</section>

							<section>
								<h4>Group Libraries</h4>
								{ this.renderGroups() }
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
	onSelect: PropTypes.func,
	path: PropTypes.array,
	updating: PropTypes.array,
	groups: PropTypes.array,
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
	onSelect: () => null,
	path: [],
	updating: []
};

module.exports = CollectionTree;

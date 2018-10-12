'use strict';

const React = require('react');
const cx = require('classnames');
const PropTypes = require('prop-types');
const memoize = require('memoize-one');
const Node = require('./node');
const Icon = require('../ui/icon');
const Input = require('../form/input');
const ActionsDropdown = require('./actions-dropdown');
const DropdownItem = require('reactstrap/lib/DropdownItem').default;
const { ViewportContext } = require('../../context');
const deepEqual = require('deep-equal');
const { noop } = require('../../utils.js');

class CollectionTree extends React.PureComponent {
	state = { opened: [], renaming: null }

	componentDidUpdate({ updating: wasUpdating }) {
		const { updating } = this.props;
		if(!deepEqual(updating, wasUpdating)) {
			let updatedCollectionKey = wasUpdating.find(cKey => !updating.includes(cKey));
			if(updatedCollectionKey &&  updatedCollectionKey === this.state.renaming) {
				this.setState({ renaming: null });
			}
		}
	}

	handleSelect(target) {
		const { onSelect, libraryKey } = this.props;
		onSelect({ library: libraryKey, ...target });
	}

	handleKeyPress(ev, target) {
		const { onSelect, libraryKey } = this.props;
		if(ev && (ev.key === 'Enter' || ev.key === ' ')) {
			ev.stopPropagation();
			onSelect({ library: libraryKey, ...target });
		}
	}

	handleOpenToggle(key, ev) {
		ev && ev.stopPropagation();
		const { opened } = this.state;
		opened.includes(key) ?
			this.setState({ opened: opened.filter(k => k !== key) }) :
			this.setState({ opened: [...opened, key ] });
	}

	handleRenameTrigger(collectionKey) {
		this.setState({ renaming: collectionKey});
	}

	handleRenameCancel() {
		this.setState({ renaming: null });
	}

	handleRename(collectionKey, value, hasChanged) {
		const { libraryKey, onRename } = this.props;
		if(hasChanged) { onRename(libraryKey, collectionKey, value); }
	}

	handleDelete(collection) {
		const { libraryKey, onDelete } = this.props;
		onDelete(libraryKey, collection);
	}

	handleAddCommit(name) {
		const { libraryKey, onAddCommit } = this.props;
		onAddCommit(libraryKey, name);
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
				const childrenCollections = this.collectionsFromKeys(
					this.childMap[collection.key] || []
				);
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

	renderCollections(collections, level, parentCollection = null) {
		const { childMap, derivedData } = this;
		const { itemsSource, isUserLibrary, onAddCommit, onAddCancel } = this.props;

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
									'selected': itemsSource === 'top'
								})}
								onClick={ this.handleSelect.bind(this, {}) }
								onKeyPress={ this.handleKeyPress.bind(this, {}) }
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
									collection
								)
							}
							hideTwisty={ !(collection.key in childMap) }
							onOpen={ this.handleOpenToggle.bind(this, collection.key) }
							onClick={ this.handleSelect.bind(this, { collection: collection.key }) }
							onKeyPress={ this.handleKeyPress.bind(this, { collection: collection.key }) }
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
										onCancel={ this.handleRenameCancel.bind(this) }
										onCommit={ this.handleRename.bind(this, collection.key) }
										value={ collection.name }
									/> :
									<React.Fragment>
										<a>{ collection.name }</a>
										<ActionsDropdown>
											<DropdownItem onClick={ this.handleRenameTrigger.bind(this, collection.key) }>
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
						this.props.isAdding && level === 1 && (
							<Node
								className={ cx({ 'new-collection': true })}
							>
								<Icon type="28/folder" className="touch" width="28" height="28" />
								<Icon type="16/folder" className="mouse" width="16" height="16" />
								<Input autoFocus
									isBusy={ this.props.isAddingBusy }
									onCommit={ this.handleAddCommit.bind(this) }
									onCancel={ onAddCancel }
									onBlur={ () => true /* cancel on blur */ }
								/>
							</Node>
						)
					}
					{
						isUserLibrary && level === 1 && (
							<Node
								className={ cx({
									'trash': true,
									'selected': itemsSource === 'trash'
								})}
								onClick={ this.handleSelect.bind(this, { trash: true }) }
								onKeyPress={ this.handleKeyPress.bind(this, { trash: true }) }
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
									onClick={ this.handleSelect.bind(this, { view: 'item-list' }) }
									onKeyPress={ this.handleKeyPress.bind(this, { view: 'item-list' }) }
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

	render() {
		const { libraryKey, collections } = this.props;
		const topLevelCollections = collections.filter(c => c.parentCollection === false);
		return this.renderCollections(topLevelCollections, 1, libraryKey);
	}

	static propTypes = {
		collections: PropTypes.arrayOf(
			PropTypes.shape({
				key: PropTypes.string.isRequired,
				parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
				name: PropTypes.string,
			}
		)),
		isAdding: PropTypes.bool,
		isAddingBusy: PropTypes.bool,
		isUserLibrary: PropTypes.bool,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string.isRequired,
		onAddCancel: PropTypes.func,
		onAddCommit: PropTypes.func,
		onDelete: PropTypes.func,
		onRename: PropTypes.func,
		onSelect: PropTypes.func,
		path: PropTypes.array,
		updating: PropTypes.array,
	};

	static defaultProps = {
		collections: [],
		onSelect: noop,
		onAddCancel: noop,
		onAddCommit: noop,
		onDelete: noop,
		onRename: noop,
		path: [],
		updating: [],
	};
}

module.exports = CollectionTree;

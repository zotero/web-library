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
const { makeChildMap } = require('../../common/collection');
const Editable = require('../editable');

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

	handleSubcollection(collectionKey) {
		const { libraryKey, onAdd } = this.props;
		const { opened } = this.state;

		if(collectionKey !== null) {
			this.setState({ opened: [...opened, collectionKey ] });
		}

		onAdd(libraryKey, collectionKey);
	}

	handleAddCommit(parentCollection, name) {
		const { libraryKey, onAddCommit } = this.props;
		onAddCommit(libraryKey, parentCollection, name);
	}

	//@TODO: memoize once
	collectionsFromKeys(collections) {
		return collections.map(
			collectionKey => this.props.collections.find(
				collection => collectionKey === collection.key
			)
		);
	}

	findRecursive(collections, test, depth = 0) {
		const result = collections.find(test);
		if(result) { return [result, depth]; }
		for(let collection of collections) {
			const childrenCollections = this.collectionsFromKeys(
				this.childMap[collection.key] || []
			);
			const result = this.findRecursive(childrenCollections, test, depth + 1);
			if(result[0]) { return result; }
		}
		return [null, depth];
	}

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
		return collections.length ? makeChildMap(collections) : {};
	}

	get derivedData() {
		const { collections, path } = this.props;
		return this.makeDerivedData(collections, path, this.state.opened);
	}

	renderCollections(collections, level, parentCollection = null) {
		const { childMap, derivedData } = this;
		const { libraryKey, itemsSource, isUserLibrary, isCurrentLibrary,
			virtual, onAddCancel, device } = this.props;


		const [selected, selectedDepth] = this.findRecursive(
			collections,
			col => derivedData[col.key].isSelected
		);

		// if isSelected is deeper in this tree, hasOpen is true
		// if isSelected is a directly in collections, hasOpen is only true
		// if selected item has subcollections (otherwise it's selected but not open)
		const hasOpen = selected !== null && (
			device.isSingleColumn || selectedDepth > 0 ||
			(selectedDepth == 0 && selected.key in childMap)
		);

		const isAllItemsSelected = !device.isSingleColumn &&
			!['trash', 'publications', 'query'].includes(itemsSource) &&
			parentCollection === null && selected === null;

		const isItemsSelected = !device.isSingleColumn &&
			!['trash', 'publications', 'query'].includes(itemsSource) &&
			parentCollection !== null && selected === null;

		// at least one collection contains subcollections
		const hasNested = collections.some(c => c.key in childMap);

		// on mobiles, there is extra level that only contains "items"
		const isLastLevel = device.isSingleColumn ? collections.length === 0 : !hasNested;

		const hasVirtual = virtual !== null && (
				(parentCollection && virtual.collectionKey === parentCollection.key) ||
				(virtual.collectionKey === null && level === 1)
			);

		collections.sort((c1, c2) =>
			c1.name.toUpperCase().localeCompare(c2.name.toUpperCase())
		);

		return (
			<div className={ cx('level', `level-${level}`, {
				'has-open': hasOpen, 'level-last': isLastLevel
			}) }>
				<ul className="nav" role="group">
					{ device.isTouchOrSmall && level === 1 && parentCollection === null && (
						<Node
							className={ cx({
								'selected': isAllItemsSelected,
							})}
							onClick={ this.handleSelect.bind(this, { view: 'item-list' }) }
							onKeyPress={ this.handleKeyPress.bind(this, { view: 'item-list' }) }
						>
							<Icon type="28/document" className="touch" width="28" height="28" />
							<Icon type="16/document" className="mouse" width="16" height="16" />
							<div className="truncate">All Items</div>
						</Node>
					) }
					{ device.isTouchOrSmall && parentCollection && (
						<Node
							className={ cx({
								'selected': isItemsSelected,
							})}
							onClick={ this.handleSelect.bind(this, { view: 'item-list', collection: parentCollection.key }) }
							onKeyPress={ this.handleKeyPress.bind(this, { view: 'item-list', collection: parentCollection.key }) }
						>
							<Icon type="28/document" className="touch" width="28" height="28" />
							<Icon type="16/document" className="mouse" width="16" height="16" />
							<div className="truncate">Items</div>
						</Node>
					) }
					{ collections.map(collection => {
						const hasSubCollections = collection.key in childMap ||
							(virtual !== null && virtual.collectionKey === collection.key);
						return (
						<Node
							key={ collection.key }
							className={ cx({
								'open': derivedData[collection.key].isOpen,
								'selected': derivedData[collection.key].isSelected,
								'collection': true,
							})}
							subtree={
								(hasSubCollections || device.isSingleColumn) ? this.renderCollections(
									this.collectionsFromKeys(childMap[collection.key] || []),
									level + 1,
									collection
								) : null
							}
							hideTwisty={ !hasSubCollections }
							onOpen={ this.handleOpenToggle.bind(this, collection.key) }
							onClick={ this.handleSelect.bind(this, { collection: collection.key }) }
							onKeyPress={ this.handleKeyPress.bind(this, { collection: collection.key }) }
							label={ collection.name }
							isOpen={ derivedData[collection.key].isOpen }
							icon="folder"
							dndTarget={ { 'targetType': 'collection', collectionKey: collection.key, libraryKey } }
						>
								<Icon type={ hasSubCollections ? '28/folders' : '28/folder' } className="touch" width="28" height="28" />
								<Icon type={ '16/folder' } className="mouse" width="16" height="16" />
								{
									this.state.renaming === collection.key ?
									<Editable
										autoFocus
										selectOnFocus
										isActive={ true }
										isBusy={ this.props.updating.includes(collection.key) }
										onBlur={ () => false /* commit on blur */ }
										onCancel={ this.handleRenameCancel.bind(this) }
										onCommit={ this.handleRename.bind(this, collection.key) }
										value={ collection.name }
									/> :
									<React.Fragment>
										<div className="truncate">{ collection.name }</div>
										<ActionsDropdown>
											<DropdownItem onClick={ this.handleRenameTrigger.bind(this, collection.key) }>
												Rename
											</DropdownItem>
											<DropdownItem onClick={ this.handleDelete.bind(this, collection) }>
												Delete
											</DropdownItem>
											<DropdownItem onClick={ this.handleSubcollection.bind(this, collection.key) }>
												New Subcollection
											</DropdownItem>
										</ActionsDropdown>
									</React.Fragment>
								}

						</Node>
						);
					}) }
					{
						hasVirtual && (
							<Node
								className={ cx({ 'new-collection': true })}
							>
								<Icon type="28/folder" className="touch" width="28" height="28" />
								<Icon type="16/folder" className="mouse" width="16" height="16" />
								<Editable autoFocus
									isBusy={ virtual.isBusy }
									isActive={ true }
									onCommit={ this.handleAddCommit.bind(
										this, parentCollection ? parentCollection.key : null
									) }
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
									'publications': true,
									'selected': itemsSource === 'publications'
								})}
								onClick={ this.handleSelect.bind(this, { publications: true }) }
								onKeyPress={ this.handleKeyPress.bind(this, { publications: true }) }
								dndTarget={ { 'targetType': 'publications', libraryKey } }
							>
								<Icon type="28/document" className="touch" width="28" height="28" />
								<Icon type="16/document" className="mouse" width="16" height="16" />
								<div className="truncate">My Publications</div>
							</Node>
						)
					}
					{
						level === 1 && (
							<Node
								className={ cx({
									'trash': true,
									'selected': isCurrentLibrary && itemsSource === 'trash'
								})}
								onClick={ this.handleSelect.bind(this, { trash: true }) }
								onKeyPress={ this.handleKeyPress.bind(this, { trash: true }) }
								dndTarget={ { 'targetType': 'trash', libraryKey } }
							>
								<Icon type="28/trash" className="touch" width="28" height="28" />
								<Icon type="16/trash" className="mouse" width="16" height="16" />
								<div className="truncate">Trash</div>
							</Node>
						)
					}
				</ul>
			</div>
		);
	}

	render() {
		const { collections } = this.props;
		const topLevelCollections = collections.filter(c => c.parentCollection === false);
		return this.renderCollections(topLevelCollections, 1);
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
		onAdd: PropTypes.func,
		onAddCancel: PropTypes.func,
		onAddCommit: PropTypes.func,
		onDelete: PropTypes.func,
		onRename: PropTypes.func,
		onSelect: PropTypes.func,
		path: PropTypes.array,
		updating: PropTypes.array,
		virtual: PropTypes.object,
	};

	static defaultProps = {
		collections: [],
		onAdd: noop,
		onAddCancel: noop,
		onAddCommit: noop,
		onDelete: noop,
		onRename: noop,
		onSelect: noop,
		path: [],
		updating: [],
	};
}

module.exports = CollectionTree;

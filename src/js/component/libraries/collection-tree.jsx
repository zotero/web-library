'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import deepEqual from 'deep-equal';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import Node from './node';
import Icon from '../ui/icon';
import { noop } from '../../utils.js';
import { makeChildMap } from '../../common/collection';
import Editable from '../editable';
import { BIBLIOGRAPHY, COLLECTION_RENAME, COLLECTION_ADD,
	EXPORT } from '../../constants/modals';

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

	handleOpenToggle(key, shouldOpen = null) {
		const { opened } = this.state;

		if(shouldOpen == null) {
			shouldOpen = !opened.includes(key);
		}

		shouldOpen ?
			this.setState({ opened: [...opened, key ] }) :
			this.setState({ opened: opened.filter(k => k !== key) });
	}

	handleRenameTrigger(collectionKey, ev) {
		const { device, toggleModal } = this.props;
		ev.stopPropagation();

		if(device.isTouchOrSmall) {
			toggleModal(COLLECTION_RENAME, true, { collectionKey });
		} else {
			this.setState({ renaming: collectionKey});
		}
	}

	handleRenameCancel() {
		this.setState({ renaming: null });
	}

	handleRename(collectionKey, value, hasChanged) {
		const { libraryKey, onRename } = this.props;
		if(hasChanged) {
			onRename(libraryKey, collectionKey, value);
		} else {
			this.setState({ renaming: null });
		}
	}

	handleDelete(collection, ev) {
		ev.stopPropagation();
		const { libraryKey, onDelete } = this.props;
		onDelete(libraryKey, collection);
	}

	handleSubcollection(collectionKey, ev) {
		const { device, libraryKey, onAdd, toggleModal } = this.props;
		const { opened } = this.state;

		ev.stopPropagation();
		if(device.isTouchOrSmall) {
			toggleModal(COLLECTION_ADD, true, { parentCollectionKey: collectionKey });
		} else {
			if(collectionKey !== null) {
				this.setState({ opened: [...opened, collectionKey ] });
			}

			onAdd(libraryKey, collectionKey);
		}
	}

	handleAddCommit(parentCollection, name) {
		const { libraryKey, onAddCommit, onAddCancel } = this.props;
		if(name) {
			onAddCommit(libraryKey, parentCollection, name);
		} else {
			onAddCancel();
		}
	}

	handleBibliography = ev => {
		const { toggleModal, libraryKey } = this.props;
		const node = ev.currentTarget.closest('[data-collection-key]');
		const { collectionKey } = node.dataset;
		toggleModal(BIBLIOGRAPHY, true, { libraryKey, collectionKey });
		ev.preventDefault();
		ev.stopPropagation();
	}

	handleExport = ev => {
		const { libraryKey, toggleModal } = this.props;
		const node = ev.currentTarget.closest('[data-collection-key]');
		const { collectionKey } = node.dataset;
		toggleModal(EXPORT, true, { libraryKey, collectionKey });
		ev.preventDefault();
		ev.stopPropagation();
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
		return [null, null];
	}

	makeDerivedData = memoize((collections, path, opened, isTouchOrSmall) => {
		return collections.reduce((aggr, c) => {
			const derivedData = {
				isSelected: false,
				isOpen: false,
			};

			let index = path.indexOf(c.key);
			derivedData['isSelected'] = index >= 0 && index === path.length - 1;
			if(!isTouchOrSmall && opened.includes(c.key)) {
				derivedData['isOpen'] = true;
			} else if(isTouchOrSmall) {
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
		const { collections, path, device } = this.props;
		return this.makeDerivedData(collections, path, this.state.opened, device.isTouchOrSmall);
	}

	renderCollections(collections, level, parentCollection = null) {
		const { childMap, derivedData } = this;
		const { libraryKey, itemsSource, isMyLibrary, isCurrentLibrary,
			virtual, onAddCancel, device, path, view, isPickerMode,
			picked, isReadOnly } = this.props;

		const [selected, selectedDepth] = this.findRecursive(
			collections,
			col => derivedData[col.key].isSelected
		);

		const selectedHasChildren = selected !== null && selected.key in childMap;

		// if isSelected is deeper in this tree, hasOpen is true
		// if isSelected is a directly in collections, hasOpen is only true
		// if selected item has subcollections (otherwise it's selected but not open)
		const hasOpen = selected !== null && (
			device.isSingleColumn || selectedDepth > 0 ||
			(selectedDepth === 0 && selectedHasChildren)
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

		// used to decide whether nodes are tabbable on touch devices
		const isSiblingOfSelected = selectedDepth === 0;
		const isChildOfSelected = (parentCollection && derivedData[parentCollection.key].isSelected) ||
			(parentCollection === null && path.length === 0 && view !== 'libraries');

		const shouldBeTabbableOnTouch = isCurrentLibrary &&
			(isChildOfSelected || (isSiblingOfSelected && !selectedHasChildren)) &&
			(!device.isSingleColumn || (device.isSingleColumn && (
				view === 'collection' || view === 'library'))
			);

		const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;

		collections.sort((c1, c2) =>
			c1.name.toUpperCase().localeCompare(c2.name.toUpperCase())
		);

		return (
			<div className={ cx('level', `level-${level}`, {
				'has-open': hasOpen, 'level-last': isLastLevel
			}) }>
				<ul className="nav" role="group">
					{ !isPickerMode && device.isTouchOrSmall && level === 1 && parentCollection === null && (
						<Node
							className={ cx({
								'selected': isAllItemsSelected,
							})}
							tabIndex={ shouldBeTabbable ? "0" : null }
							onClick={ ev => this.handleSelect({ view: 'item-list' }, ev) }
						>
							<Icon type="28/document" className="touch" width="28" height="28" />
							<Icon type="16/document" className="mouse" width="16" height="16" />
							<div className="truncate">All Items</div>
						</Node>
					) }
					{ !isPickerMode && device.isTouchOrSmall && parentCollection && (
						<Node
							className={ cx({
								'selected': isItemsSelected,
							})}
							tabIndex={ shouldBeTabbable ? "0" : null }
							onClick={ ev => this.handleSelect(
								{ view: 'item-list', collection: parentCollection.key }, ev
							) }
						>
							<Icon type="28/document" className="touch" width="28" height="28" />
							<Icon type="16/document" className="mouse" width="16" height="16" />
							<div className="truncate">Items</div>
						</Node>
					) }
					{ collections.map(collection => {
						const hasSubCollections = collection.key in childMap ||
							(virtual !== null && virtual.collectionKey === collection.key);
						const isSelected = derivedData[collection.key].isSelected;

						return (
						<Node
							data-collection-key={ collection.key }
							key={ collection.key }
							className={ cx({
								'open': derivedData[collection.key].isOpen,
								'selected': isSelected,
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
							onOpen={ shouldOpen => this.handleOpenToggle(collection.key, shouldOpen) }
							onClick={ ev => this.handleSelect({ collection: collection.key }, ev) }
							onRename={ ev => device.isTouchOrSmall ? noop() : this.handleRenameTrigger(collection.key, ev) }
							label={ collection.name }
							isOpen={ derivedData[collection.key].isOpen }
							shouldBeDraggable = { this.state.renaming !== collection.key }
							tabIndex={ shouldBeTabbable ? "0" : null }
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
										{ isPickerMode ? (
											<input
												type="checkbox"
												checked={ picked.some(({ collection: c, library: l }) => l === libraryKey && c === collection.key) }
												onChange={ ev => this.props.onPickerPick({ collection: collection.key, library: libraryKey }, ev) }
												onClick={ ev => ev.stopPropagation() }
											/>
										) : (
										<UncontrolledDropdown>
											<DropdownToggle
												className="btn-icon dropdown-toggle"
												color={ null }
												tabIndex={ shouldBeTabbable ? "0" : "-1" }
												title="More"
												onClick={ ev => ev.stopPropagation() }
											>
												<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
												<Icon type={ '16/options' } width="16" height="16" className="mouse" />
											</DropdownToggle>
											<DropdownMenu right>
												{
													!isReadOnly && (
														<React.Fragment>
														<DropdownItem
															onClick={ ev => this.handleRenameTrigger(collection.key, ev) }
														>
															Rename
														</DropdownItem>
														<DropdownItem
															onClick={ ev => this.handleDelete(collection, ev) }
														>
															Delete
														</DropdownItem>
														<DropdownItem
															onClick={ ev => this.handleSubcollection(collection.key, ev) }
														>
															New Subcollection
														</DropdownItem>
														<DropdownItem divider />
														</React.Fragment>
													)
												}
												<DropdownItem onClick={ this.handleExport }>
													Export Collection
												</DropdownItem>
												<DropdownItem onClick={ this.handleBibliography }>
													Create Bibliography
												</DropdownItem>
											</DropdownMenu>
										</UncontrolledDropdown>
										)}
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
								<Editable
									autoFocus
									isBusy={ virtual.isBusy }
									isActive={ true }
									onCommit={ this.handleAddCommit.bind(
										this, parentCollection ? parentCollection.key : null
									) }
									onCancel={ onAddCancel }
									onBlur={ () => false /* commit on blur */ }
								/>
							</Node>
						)
					}
					{
						!isPickerMode && isMyLibrary && level === 1 && (
							<Node
								className={ cx({
									'publications': true,
									'selected': itemsSource === 'publications'
								})}
								tabIndex={ shouldBeTabbable ? "0" : null }
								onClick={ ev => this.handleSelect({ publications: true }, ev) }
								dndTarget={ { 'targetType': 'publications', libraryKey } }
							>
								<Icon type="28/document" className="touch" width="28" height="28" />
								<Icon type="16/document" className="mouse" width="16" height="16" />
								<div className="truncate">My Publications</div>
							</Node>
						)
					}
					{
						!isPickerMode && !isReadOnly && level === 1 && (
							<Node
								className={ cx({
									'trash': true,
									'selected': isCurrentLibrary && itemsSource === 'trash'
								})}
								tabIndex={ shouldBeTabbable ? "0" : null }
								onClick={ ev => this.handleSelect({ trash: true }, ev) }
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
		device: PropTypes.object,
		collections: PropTypes.arrayOf(
			PropTypes.shape({
				key: PropTypes.string.isRequired,
				parentCollection: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
				name: PropTypes.string,
			}
		)),
		isAdding: PropTypes.bool,
		isAddingBusy: PropTypes.bool,
		isCurrentLibrary: PropTypes.bool,
		isMyLibrary: PropTypes.bool,
		isPickerMode: PropTypes.bool,
		itemsSource: PropTypes.string,
		libraryKey: PropTypes.string.isRequired,
		onAdd: PropTypes.func,
		onAddCancel: PropTypes.func,
		onAddCommit: PropTypes.func,
		onDelete: PropTypes.func,
		onPickerPick: PropTypes.func,
		onRename: PropTypes.func,
		onSelect: PropTypes.func,
		path: PropTypes.array,
		picked: PropTypes.array,
		updating: PropTypes.array,
		view: PropTypes.string,
		virtual: PropTypes.object,
	};

	static defaultProps = {
		collections: [],
		onAdd: noop,
		onAddCancel: noop,
		onAddCommit: noop,
		onDelete: noop,
		onPickerPick: noop,
		onRename: noop,
		onSelect: noop,
		path: [],
		picked: [],
		updating: [],
		virtual: null,
	};
}

export default CollectionTree;

'use strict';

import React, { useMemo, useState, useCallback } from 'react';
import cx from 'classnames';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';
import Node from './node';
import Icon from '../ui/icon';
import withDevice from '../../enhancers/with-device';
import { stopPropagation } from '../../utils.js';
import { pick } from '../../common/immutable';
import Editable from '../editable';
import { BIBLIOGRAPHY, COLLECTION_RENAME, COLLECTION_ADD, EXPORT, MOVE_COLLECTION } from '../../constants/modals';

const makeDerivedData = (collections, path = [], opened, isTouchOrSmall) => {
	const selectedParentKey = path[path.length - 2];
	const childLookup = {};
	const derivedData = Object.values(collections).reduce((aggr, c) => {
		const derivedData = {
			selectedDepth: null, //how far down is selected
			isSelected: false,
			isOpen: false,
			...aggr[c.key]
		};

		// reverse so that selected is first element
		const reversedPath = [...path];
		reversedPath.reverse();

		const index = reversedPath.indexOf(c.key);
		derivedData['isSelected'] = index === 0
		derivedData['selectedDepth'] = index;
		if(!isTouchOrSmall && opened.includes(c.key)) {
			derivedData['isOpen'] = true;
		} else if(isTouchOrSmall) {
			if(index >= 0) {
				derivedData['isOpen'] = true;
			} else if(index !== -1) {
				derivedData['isOpen'] = false;
			}
		}

		if(c.parentCollection) {
			childLookup[c.parentCollection] ?
				childLookup[c.parentCollection].push(c.key) :
				childLookup[c.parentCollection] = [c.key];

			if(aggr[c.parentCollection]) {
				aggr[c.parentCollection].hasChildren = true;
			} else {
				aggr[c.parentCollection] = { hasChildren: true }
			}
		}

		aggr[c.key] = derivedData
		return aggr;
	}, {});

	if(selectedParentKey) {
		const selectedSiblingKeys = childLookup[selectedParentKey];
		selectedSiblingKeys.forEach(siblingKey => derivedData[siblingKey].selectedDepth = 0);
	}

	return derivedData;
}

const makeCollectionsPath = (collectionKey, allCollections) => {
	const path = [];
	var nextKey = collectionKey;
	while(nextKey) {
		const collection = allCollections[nextKey];
		if(collection) {
			path.push(collection.key);
			nextKey = collection.parentCollection;
		} else {
			nextKey = null;
		}
	}

	return path.reverse();
}

const ItemsNode = withDevice(({ isPickerMode, device, parentCollectionKey, selectedCollectionKey, itemsSource, selectNode, ...rest }) => {
	if(isPickerMode || !device.isTouchOrSmall) {
		return null;
	}

	const isSelected = !['trash', 'publications', 'query'].includes(itemsSource) && (
		parentCollectionKey === selectedCollectionKey || (!parentCollectionKey && !selectedCollectionKey)
	);

	const shouldBeTabbableOnTouch = parentCollectionKey === selectedCollectionKey; //@TODO: cover leaf-node-on-tablet scenario
	const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;

	const handleClick = useCallback(() => {
		selectNode({
			view: 'item-list',
			collection: parentCollectionKey
		});
	}, []);

	return (
		<Node
			className={ cx({ 'selected': isSelected })}
			tabIndex={ shouldBeTabbable ? "-2" : null }
			onClick={ handleClick }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
		>
			<Icon type="28/document" className="touch" width="28" height="28" />
			<Icon type="16/document" className="mouse" width="16" height="16" />
			<div className="truncate">
				{ parentCollectionKey ? 'Items' : 'All Items' }
			</div>
		</Node>
	);
});


const VirtualCollectionNode = ({ virtual, cancelAdd, commitAdd, parentLibraryKey, parentCollectionKey }) => {
	const handleEditableCommit = useCallback(newValue => {
		commitAdd(parentLibraryKey, parentCollectionKey, newValue);
	});

	if(!virtual) {
		return null;
	}

	if(virtual.collectionKey !== parentCollectionKey) {
		return null;
	}

	return (
		<Node
			className={ cx({ 'new-collection': true })}
		>
			<Icon type="28/folder" className="touch" width="28" height="28" />
			<Icon type="16/folder" className="mouse" width="16" height="16" />
			<Editable
				autoFocus
				isBusy={ virtual.isBusy }
				isActive={ true }
				onCommit={ handleEditableCommit }
				onCancel={ cancelAdd }
				onBlur={ () => false /* commit on blur */ }
			/>
		</Node>
	);
}

const PublicationsNode = ({ isSelected, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const handleClick = useCallback(() => {
		selectNode({ publications: true });
	}, []);

	return (
		<Node
			className={ cx({
				'publications': true,
				'selected': isSelected
			})}
			tabIndex={ shouldBeTabbable ? "-2" : null }
			onClick={ handleClick }
			dndTarget={ { 'targetType': 'publications', libraryKey: parentLibraryKey } }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
		>
			<Icon type="28/document" className="touch" width="28" height="28" />
			<Icon type="16/document" className="mouse" width="16" height="16" />
			<div className="truncate">My Publications</div>
		</Node>
	);
}

const TrashNode = ({ isSelected, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const handleClick = useCallback(() => {
		selectNode({ trash: true });
	}, []);

	return (
		<Node
			className={ cx({
				'trash': true,
				'selected': isSelected
			})}
			tabIndex={ shouldBeTabbable ? "-2" : null }
			onClick={ handleClick }
			dndTarget={ { 'targetType': 'trash', libraryKey: parentLibraryKey } }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
		>
			<Icon type="28/trash" className="touch" width="28" height="28" />
			<Icon type="16/trash" className="mouse" width="16" height="16" />
			<div className="truncate">Trash</div>
		</Node>
	);
}

const LevelWrapper = ({ children, level, hasOpen, isLastLevel }) => {
	return (
		<div className={ cx('level', `level-${level}`, {
			'has-open': hasOpen, 'level-last': isLastLevel
		}) }>
			<ul className="nav" role="group">
				{ children }
			</ul>
		</div>
	);
}


const DotMenu = withDevice(({ collection, deleteCollection, device,
dotMenuFor, isReadOnly, navigate, opened, parentLibraryKey, setDotMenuFor,
setOpened, setRenaming, addVirtual, toggleModal }) => {
	const isOpen = dotMenuFor === collection.key;

	const handleToggle = useCallback(ev => {
		setDotMenuFor(isOpen ? null : collection.key);
		if(ev.type === 'click') {
			ev.stopPropagation();
		}
	});

	const handleRenameClick = useCallback(() => {
		if(device.isTouchOrSmall) {
			toggleModal(COLLECTION_RENAME, true, { collectionKey: collection.key });
		} else {
			setRenaming(collection.key);
		}
	});

	const handleDeleteClick = useCallback(() => {
		deleteCollection(collection, parentLibraryKey);
		navigate({}, true);
	});

	const handleSubcollectionClick = useCallback(ev => {
		ev.stopPropagation();
		if(device.isTouchOrSmall) {
			toggleModal(COLLECTION_ADD, true, { parentCollectionKey: collection.key });
		} else {
			setOpened([...opened, collection.key ]);
			addVirtual(parentLibraryKey, collection.key);
		}
	});

	const handleMoveCollectionClick = useCallback(() => {
		toggleModal( MOVE_COLLECTION, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } );
	});

	const handleExportClick = useCallback(() => {
		toggleModal(EXPORT, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } );
	});

	const handleBibliographyClick = useCallback(() => {
		toggleModal(BIBLIOGRAPHY, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } );
	});

	return (
		<Dropdown
			isOpen={ isOpen }
			toggle={ handleToggle }
		>
			<DropdownToggle
				tabIndex={ -3 }
				className="btn-icon dropdown-toggle"
				color={ null }
				title="More"
				onClick={ handleToggle }
			>
				<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
				<Icon type={ '16/options' } width="16" height="16" className="mouse" />
			</DropdownToggle>
			<DropdownMenu right>
				{
					!isReadOnly && (
						<React.Fragment>
						<DropdownItem
							onClick={ handleRenameClick }
						>
							Rename
						</DropdownItem>
						<DropdownItem
							onClick={ handleDeleteClick }
						>
							Delete
						</DropdownItem>
						<DropdownItem
							onClick={ handleSubcollectionClick }
						>
							New Subcollection
						</DropdownItem>
						{ device.isTouchOrSmall && (
							<DropdownItem
								onClick={ handleMoveCollectionClick }
							>
								Move Collection
							</DropdownItem>
						)}
						<DropdownItem divider />
						</React.Fragment>
					)
				}
				<DropdownItem onClick={ handleExportClick }>
					Export Collection
				</DropdownItem>
				<DropdownItem onClick={ handleBibliographyClick }>
					Create Bibliography
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
});

const PickerCheckbox = ({ collectionKey, onPickerPick, picked, parentLibraryKey }) => {
	const handleChange = useCallback(ev => {
		onPickerPick({ collectionKey, libraryKey: parentLibraryKey }, ev);
	});

	const isChecked = useMemo(() =>
		picked.some(({ collectionKey: c, libraryKey: l }) => l === parentLibraryKey && c === collectionKey),
		[picked, parentLibraryKey]
	);

	return (
		<input
			type="checkbox"
			checked={ isChecked }
			onChange={ handleChange }
			onClick={ stopPropagation }
		/>
	);
}

const CollectionNode = withDevice(({ allCollections, derivedData, collection,
device, level, selectedCollectionKey, isCurrentLibrary, view,
parentLibraryKey, renaming, setRenaming, updateCollection, isPickerMode, ...rest }) => {
	const handleClick = useCallback(() => {
		const { selectNode } = rest;
		selectNode({ collection: collection.key });
	});

	const handleRenameTrigger = useCallback(() => {
		if(device.isTouchOrSmall) {
			return;
		}
		setRenaming(collection.key);
	});

	const handleRenameCancel = useCallback(() => {
		setRenaming(null);
	});

	const handleRenameCommit = useCallback(newValue => {
		updateCollection(collection.key, { name: newValue }, parentLibraryKey);
		setRenaming(null);
	});

	const handleDrag = useCallback((src, target) => {
		const patch = {
			parentCollection: target.collectionKey || false
		};
		if(src.libraryKey === target.libraryKey) {
			updateCollection(src.collectionKey, patch, src.libraryKey);
		} else {
			//@TODO: Support for moving collections across libraries #227
		}
	});

	const collections = allCollections.filter(c => c.parentCollection === collection.key );
	const hasSubCollections = (device.isSingleColumn || collections.length > 0);
	const { selectedDepth } = derivedData[collection.key];
	const selectedHasChildren = selectedCollectionKey && derivedData[selectedCollectionKey].hasChildren;

	// if isSelected is deeper in this tree, hasOpen is true
	// if isSelected is a directly in collections, hasOpen is only true
	// if selected item has subcollections (otherwise it's selected but not open)
	const hasOpen = selectedDepth > 0;

	// at least one collection contains subcollections
	const hasNested = collections.some(c => derivedData[c.key].hasChildren );

	// on mobiles, there is extra level that only contains "items"
	const isLastLevel = device.isSingleColumn ? collections.length === 0 : !hasNested;

	// used to decide whether nodes are tabbable on touch devices
	const isSiblingOfSelected = selectedDepth === 0;
	const isChildOfSelected = (collection.parentCollection && derivedData[collection.parentCollection].isSelected);
		// || (collection.parentCollection === null && path.length === 0 && view !== 'libraries');

	const shouldBeTabbableOnTouch = isCurrentLibrary &&
		(isChildOfSelected || (isSiblingOfSelected && !selectedHasChildren)) &&
		(!device.isSingleColumn || (device.isSingleColumn && (
			view === 'collection' || view === 'library'))
		);

	const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;

	return (
		<Node
			className={ cx({
				'open': derivedData[collection.key].isOpen,
				'selected': derivedData[collection.key].isSelected,
				'collection': true,
			})}
			data-collection-key={ collection.key }
			dndTarget={ { 'targetType': 'collection', collectionKey: collection.key, libraryKey: parentLibraryKey } }
			isOpen={ derivedData[collection.key].isOpen }
			onClick={ handleClick }
			onDrag={ handleDrag }
			onRename={ handleRenameTrigger }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			{ ...pick(rest, ['onOpen', 'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev']) }
			subtree={ hasSubCollections ? (
				<LevelWrapper hasOpen={ hasOpen } level={ level } isLastLevel={ isLastLevel }>
					<CollectionsNodeList
						{ ...rest }
						parentCollectionKey={ collection.key }
						parentLibraryKey={ parentLibraryKey }
						collections = { collections }
						allCollections={ allCollections }
						derivedData={ derivedData }
						level={ level + 1 }
						selectedCollectionKey={ selectedCollectionKey }
					/>
				</LevelWrapper>
			) : null }
		>
			<Icon type={ hasSubCollections ? '28/folders' : '28/folder' } className="touch" width="28" height="28" />
			<Icon type={ '16/folder' } className="mouse" width="16" height="16" />
			{ renaming === collection.key ? (
				<Editable
					autoFocus
					selectOnFocus
					isActive={ true }
					isBusy={ false /* TODO: Show spinner when busy */ }
					onBlur={ () => false /* commit on blur */ }
					onCancel={ handleRenameCancel }
					onCommit={ handleRenameCommit }
					value={ collection.name }
				/> ) : (
					<React.Fragment>
						<div className="truncate">{ collection.name }</div>
						{ isPickerMode ? (
							<PickerCheckbox
								collectionKey = { collection.key }
								parentLibraryKey = { parentLibraryKey }
								{ ...pick(rest, ['onPickerPick', 'picked']) }
							/>
						) : (
							<DotMenu
								collection = { collection }
								setRenaming = { setRenaming }
								parentLibraryKey = { parentLibraryKey }
								{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd',
								'deleteCollection', 'dotMenuFor', 'isReadOnly', 'navigate',
								'opened', 'setDotMenuFor', 'setOpened',
								'toggleModal']) }
							/>
						) }
					</React.Fragment>
				)
			}
		</Node>
	);
});

const CollectionsNodeList = ({ collections, parentCollectionKey, ...rest }) => {
	return (
		<React.Fragment>
			<ItemsNode parentCollectionKey={ parentCollectionKey } { ...rest } />
			{ collections.map(c =>
				<CollectionNode
					key={ c.key }
					collection={ c }
					parentCollectionKey={ parentCollectionKey }
					{ ...rest }
				/>
			) }
			<VirtualCollectionNode
				parentCollectionKey= { parentCollectionKey }
				{ ...pick(rest, ['virtual', 'cancelAdd', 'commitAdd', 'parentLibraryKey'] )}
			/>
		</React.Fragment>
	)
}

const CollectionTree = withDevice(props => {
	// check if all collections in given library has been fetched, skip rendering otherwise
	// memoize collections array and all the other params, or perhaps rendered tree?
	//
	const { device, parentLibraryKey, libraries, librariesData, selectedCollectionKey,
		selectedLibraryKey, itemsSource, view, collectionCountByLibrary, ...rest } = props;

	const collectionsTotalCount = collectionCountByLibrary[parentLibraryKey];
	const collectionsCurrentCount = (Object.values(librariesData[parentLibraryKey].collections) || []).length;
	const hasFetchedAllCollections = collectionsCurrentCount === collectionsTotalCount;

	if(!hasFetchedAllCollections) {
		// Only render tree once all collections are fetched. No need to show spinner, this is handled by parent
		return null;
	}

	const handleOpenToggle = (ev, shouldOpen = null) => {
		const collectionKey = ev.currentTarget.closest('[data-collection-key]').dataset.collectionKey;
		toggleOpen(collectionKey, shouldOpen);
	}

	const toggleOpen = (collectionKey, shouldOpen = null) => {
		if(shouldOpen === null) {
			shouldOpen = !opened.includes(collectionKey);
		}

		shouldOpen ?
			setOpened([...opened, collectionKey ]) :
			setOpened(opened.filter(k => k !== collectionKey));
	}

	const selectNode = partialPath => {
		const { navigate } = props;
		const path = { ...partialPath, library: parentLibraryKey }
		navigate(path, true);
	}

	const isCurrentLibrary = parentLibraryKey === selectedLibraryKey;

	const allCollections = (Object.values(librariesData[parentLibraryKey].collections) || []);

	const path = useMemo(() => makeCollectionsPath(
		selectedCollectionKey, librariesData[parentLibraryKey].collections),
		[allCollections, selectedCollectionKey]
	);

	const [opened, setOpened] = useState(path.slice(0, -1));
	const [renaming, setRenaming] = useState(null);
	const [dotMenuFor, setDotMenuFor] = useState(null);

	const derivedData = useMemo(
		() => makeDerivedData(librariesData[parentLibraryKey].collections, path, opened, device.isTouchOrSmall),
		[allCollections, path, opened, device]
	);

	const selectedDepth = path.length;
	const selectedHasChildren = selectedCollectionKey && (derivedData[selectedCollectionKey] || {}).hasChildren;
	const hasOpen = selectedDepth > 0 && selectedHasChildren || selectedDepth > 1;

	const collections = allCollections.filter(c => c.parentCollection === false );
	const isLastLevel = device.isSingleColumn ? false : collections.length === 0;

	const shouldBeTabbableOnTouch = isCurrentLibrary && !selectedCollectionKey;
	const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;

	const { isReadOnly } = libraries.find(l => l.key === parentLibraryKey);

	return (
		<LevelWrapper level={ 1 } hasOpen={ hasOpen } isLastLevel={ isLastLevel }>
			<CollectionsNodeList
				allCollections={ allCollections }
				collections={ collections }
				derivedData={ derivedData }
				dotMenuFor={ dotMenuFor }
				isCurrentLibrary = { isCurrentLibrary }
				isReadOnly={ isReadOnly }
				itemsSource={ itemsSource }
				level={ 2 }
				onOpen={ handleOpenToggle }
				opened={ opened }
				parentLibraryKey = { parentLibraryKey }
				renaming={ renaming }
				selectedCollectionKey={ selectedCollectionKey }
				selectNode={ selectNode }
				setDotMenuFor={ setDotMenuFor }
				setOpened={ setOpened }
				setRenaming={ setRenaming }
				view={ view }
				{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd', 'deleteCollection',
				'isPickerMode', 'navigate', 'onPickerPick', 'picked', 'onDrillDownNext',
				'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'toggleModal', 'updateCollection',
				'virtual']) }
			/>
			<PublicationsNode
				isSelected = { isCurrentLibrary && itemsSource === 'publications' }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				{ ...pick(rest, ['isPickerMode', 'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev']) }
			/>
			<TrashNode
				isSelected = { isCurrentLibrary && itemsSource === 'trash' }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				{ ...pick(rest, ['isPickerMode', 'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev']) }
			/>
		</LevelWrapper>
	);
});


export default CollectionTree;

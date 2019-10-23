'use strict';

import cx from 'classnames';
import React, { useMemo, useState, useCallback } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap/lib';

import Editable from '../editable';
import Icon from '../ui/icon';
import Node from './node';
import Spinner from '../../component/ui/spinner';
import withDevice from '../../enhancers/with-device';
import { BIBLIOGRAPHY, COLLECTION_RENAME, COLLECTION_ADD, EXPORT, MOVE_COLLECTION } from '../../constants/modals';
import { pick } from '../../common/immutable';
import { stopPropagation } from '../../utils.js';

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

const makeCollectionsPath = (collectionKey, allCollections, isCurrentLibrary) => {
	const path = [];

	if(!isCurrentLibrary) {
		return path;
	}

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

const ItemsNode = withDevice(props => {
	const { isPickerMode, device, parentCollectionKey, selectedCollectionKey, itemsSource,
		selectNode, shouldBeTabbable, ...rest } = props;

	if(isPickerMode || !device.isTouchOrSmall) {
		return null;
	}

	const isSelected = !device.isSingleColumn && !['trash', 'publications', 'query'].includes(itemsSource) && (
		parentCollectionKey === selectedCollectionKey || (!parentCollectionKey && !selectedCollectionKey)
	);

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


const VirtualCollectionNode = props => {
	const { isPickerMode, virtual, cancelAdd, commitAdd, parentLibraryKey,
			parentCollectionKey } = props;

	const handleEditableCommit = useCallback(newValue => {
		commitAdd(parentLibraryKey, parentCollectionKey, newValue);
	});

	if(isPickerMode || !virtual) {
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

const PublicationsNode = ({ isMyLibrary, isPickerMode, isSelected, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const handleClick = useCallback(() => {
		selectNode({ publications: true });
	}, []);

	if(!isMyLibrary || isPickerMode) {
		return null;
	}

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

const TrashNode = ({ isPickerMode, isReadOnly, isSelected, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const handleClick = useCallback(() => {
		selectNode({ trash: true });
	}, []);

	if(isReadOnly || isPickerMode) {
		return null;
	}

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


const DotMenu = withDevice(props => {
	const { collection, deleteCollection, device, dotMenuFor, isReadOnly, navigate, opened,
		parentLibraryKey, setDotMenuFor, setOpened, setRenaming, addVirtual, toggleModal } = props;

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

const PickerCheckbox = ({ collectionKey, pickerPick, picked, parentLibraryKey }) => {
	const handleChange = useCallback(() => {
		pickerPick({ collectionKey, libraryKey: parentLibraryKey });
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

const CollectionNode = withDevice(props => {
	const { allCollections, derivedData, createAttachmentsFromDropped, collection, device, level,
		selectedCollectionKey, isCurrentLibrary, parentLibraryKey, renaming, setRenaming,
		updateCollection, updating, virtual, isPickerMode, shouldBeTabbable, ...rest }  = props;

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
		if(newValue === '') {
			setRenaming(null);
			return;
		}

		try {
			updateCollection(collection.key, { name: newValue }, parentLibraryKey);
		} finally {
			setRenaming(null);
		}
	});

	const handleRenameKeyDown = useCallback(ev => {
		ev.stopPropagation();
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

	const handleDrop = useCallback(async droppedFiles => {
		await createAttachmentsFromDropped(droppedFiles, { collection: collection.key });
	});

	const collections = allCollections.filter(c => c.parentCollection === collection.key );
	const hasSubCollections = (device.isSingleColumn || collections.length > 0);
	const { selectedDepth } = derivedData[collection.key];

	const selectedHasChildren = isCurrentLibrary && selectedCollectionKey && derivedData[selectedCollectionKey].hasChildren;

	// if isSelected is a nested child, hasOpen is true
	// if isSelected is a direct child, hasOpen is only true if
	// either selected is not a leaf node or we're in singleColumn mode (where there is always estra "Items" node)
	const hasOpen = selectedDepth > 0 && !(selectedDepth === 1 && (!selectedHasChildren && !device.isSingleColumn));

	// at least one collection contains subcollections
	const hasNested = !!collections.find(c => derivedData[c.key].hasChildren);

	// on mobiles, there is extra level that only contains "items"
	const isLastLevel = device.isSingleColumn ? collections.length === 0 : !hasNested;

	// subtree nodes are tabbable if
	const shouldSubtreeNodesBeTabbableOnTouch = isCurrentLibrary && derivedData[collection.key].isSelected ||
		selectedDepth === 1 && !selectedHasChildren;
	const shouldSubtreeNodesBeTabbable = shouldSubtreeNodesBeTabbableOnTouch || !device.isTouchOrSmall;

	const collectionName = collection.key in updating ?
		updating[collection.key][updating[collection.key].length - 1].patch.name || collection.name :
		collection.name

	const hasVirtual = virtual && virtual.collectionKey === collection.key;

	//optimsation: skips rendering subtrees that are not visible nor relevant for transitions
	const shouldRenderSubtree =
		(device.isTouchOrSmall && (shouldSubtreeNodesBeTabbableOnTouch || selectedDepth !== -1)) ||
		(!device.isTouchOrSmall && derivedData[collection.key].isOpen);

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
			onDrag={ device.isTouchOrSmall ? null : handleDrag }
			onDrop={ device.isTouchOrSmall ? null : handleDrop }
			onRename={ device.isTouchOrSmall ? null : handleRenameTrigger }
			shouldBeDraggable={ renaming !== collection.key }
			showTwisty={ hasSubCollections }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			{ ...pick(rest, ['onOpen', 'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev']) }
			subtree={ (shouldRenderSubtree && (hasSubCollections || hasVirtual)) ? (
				<LevelWrapper hasOpen={ hasOpen } level={ level } isLastLevel={ isLastLevel }>
					<CollectionsNodeList
						{ ...rest }
						allCollections={ allCollections }
						collections = { collections }
						createAttachmentsFromDropped= { createAttachmentsFromDropped }
						derivedData={ derivedData }
						isCurrentLibrary = { isCurrentLibrary }
						isPickerMode={ isPickerMode }
						level={ level + 1 }
						parentCollectionKey={ collection.key }
						parentLibraryKey={ parentLibraryKey }
						renaming = { renaming }
						selectedCollectionKey={ selectedCollectionKey }
						setRenaming = { setRenaming }
						shouldBeTabbable = { shouldSubtreeNodesBeTabbable }
						updateCollection = { updateCollection }
						updating = { updating }
						virtual = { virtual }
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
					isBusy={ false }
					onBlur={ () => false /* commit on blur */ }
					onCancel={ handleRenameCancel }
					onCommit={ handleRenameCommit }
					onKeyDown={ handleRenameKeyDown }
					value={ collectionName }
				/> ) : (
					<React.Fragment>
						<div className="truncate">{ collectionName }</div>
						{ isPickerMode ? (
							<PickerCheckbox
								collectionKey = { collection.key }
								parentLibraryKey = { parentLibraryKey }
								{ ...pick(rest, ['pickerPick', 'picked']) }
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
	const sortedCollections = useMemo(() => {
		const copiedCollections = [ ...collections ];
		copiedCollections.sort((c1, c2) =>
			c1.name.toUpperCase().localeCompare(c2.name.toUpperCase())
		);
		return copiedCollections;
	});

	return (
		<React.Fragment>
			<ItemsNode parentCollectionKey={ parentCollectionKey } { ...rest } />
			{ sortedCollections.map(c =>
				<CollectionNode
					key={ c.key }
					collection={ c }
					parentCollectionKey={ parentCollectionKey }
					{ ...rest }
				/>
			) }
			<VirtualCollectionNode
				parentCollectionKey= { parentCollectionKey }
				{ ...pick(rest, ['virtual', 'cancelAdd', 'commitAdd', 'parentLibraryKey', 'isPickerMode'] )}
			/>
		</React.Fragment>
	)
}

const CollectionTree = withDevice(props => {
	const { collections, device, parentLibraryKey, libraries, selectedCollectionKey,
		selectedLibraryKey, itemsSource, collectionsTotalCount, navigate, ...rest } = props;

	const collectionsCurrentCount = Object.values(collections).length;
	const hasFetchedAllCollections = collectionsCurrentCount === collectionsTotalCount;

	if(!hasFetchedAllCollections) {
		// while fetching collections:
		// On touch we allow animating into next level and render a spinner
		if(device.isTouchOrSmall) {
			return (
				<div className="level level-1 level-last loading">
					<Spinner className="large" />
				</div>
			);
		}
		// On desktop no need to render anything, spinner shows next to the library node
		return null;
	}

	const handleOpenToggle = useCallback((ev, shouldOpen = null) => {
		const collectionKey = ev.currentTarget.closest('[data-collection-key]').dataset.collectionKey;
		toggleOpen(collectionKey, shouldOpen);
	});

	const toggleOpen = useCallback((collectionKey, shouldOpen = null) => {
		if(shouldOpen === null) {
			shouldOpen = !opened.includes(collectionKey);
		}

		shouldOpen ?
			setOpened([...opened, collectionKey ]) :
			setOpened(opened.filter(k => k !== collectionKey));
	})

	const selectNode = useCallback(partialPath => {
		const path = { ...partialPath, library: parentLibraryKey }
		navigate(path, true);
	});

	const isCurrentLibrary = parentLibraryKey === selectedLibraryKey;

	const allCollections = (Object.values(collections) || []);

	const path = useMemo(() => makeCollectionsPath(
		selectedCollectionKey, collections, isCurrentLibrary),
		[allCollections, selectedCollectionKey, isCurrentLibrary]
	);

	const [opened, setOpened] = useState(path.slice(0, -1));
	const [renaming, setRenaming] = useState(null);
	const [dotMenuFor, setDotMenuFor] = useState(null);

	const derivedData = useMemo(
		() => makeDerivedData(collections, path, opened, device.isTouchOrSmall, isCurrentLibrary),
		[collections, path, opened, device]
	);

	const selectedDepth = path.length;
	const selectedHasChildren = isCurrentLibrary && selectedCollectionKey && (derivedData[selectedCollectionKey] || {}).hasChildren;
	const hasOpen = (selectedDepth > 0 && (selectedHasChildren || device.isSingleColumn)) || selectedDepth > 1;

	const topLevelCollections = allCollections.filter(c => c.parentCollection === false );
	const isLastLevel = device.isSingleColumn ? false : collections.length === 0;

	const shouldBeTabbableOnTouch = isCurrentLibrary && !selectedCollectionKey;
	const shouldBeTabbable = shouldBeTabbableOnTouch || !device.isTouchOrSmall;

	const { isReadOnly, isMyLibrary } = libraries.find(l => l.key === parentLibraryKey);

	return (
		<LevelWrapper level={ 1 } hasOpen={ hasOpen } isLastLevel={ isLastLevel }>
			<CollectionsNodeList
				allCollections={ allCollections }
				collections={ topLevelCollections }
				derivedData={ derivedData }
				dotMenuFor={ dotMenuFor }
				isCurrentLibrary = { isCurrentLibrary }
				isReadOnly={ isReadOnly }
				itemsSource={ itemsSource }
				level={ 2 }
				navigate={ navigate }
				onOpen={ handleOpenToggle }
				opened={ opened }
				parentLibraryKey = { parentLibraryKey }
				renaming={ renaming }
				selectedCollectionKey={ selectedCollectionKey }
				selectNode={ selectNode }
				setDotMenuFor={ setDotMenuFor }
				setOpened={ setOpened }
				setRenaming={ setRenaming }
				shouldBeTabbable={ shouldBeTabbable }
				{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd', 'createAttachmentsFromDropped',
				'deleteCollection', 'navigate', 'pickerPick', 'picked', 'onDrillDownNext',
				'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'toggleModal', 'updateCollection',
				'updating', 'virtual', 'isPickerMode']) }
			/>
			<PublicationsNode
				isSelected = { isCurrentLibrary && itemsSource === 'publications' }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				isMyLibrary = { isMyLibrary }
				{ ...pick(rest, ['isPickerMode', 'onDrillDownNext', 'onDrillDownPrev',
				'onFocusNext', 'onFocusPrev']) }
			/>
			<TrashNode
				isSelected = { isCurrentLibrary && itemsSource === 'trash' }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				isReadOnly = { isReadOnly }
				{ ...pick(rest, ['isPickerMode', 'onDrillDownNext', 'onDrillDownPrev',
				'onFocusNext', 'onFocusPrev']) }
			/>
		</LevelWrapper>
	);
});

export default React.memo(CollectionTree);

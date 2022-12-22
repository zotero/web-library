import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, forwardRef, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from '../ui/dropdown';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import Editable from '../editable';
import Icon from '../ui/icon';
import Node from './node';
import Spinner from '../../component/ui/spinner';
import { COLLECTION_RENAME, COLLECTION_ADD, MOVE_COLLECTION } from '../../constants/modals';
import { createAttachmentsFromDropped, deleteCollection, toggleModal, updateCollection, navigate } from '../../actions';
import { omit, pick } from '../../common/immutable';
import { isTriggerEvent } from '../../common/event';
import { stopPropagation, getUniqueId, noop } from '../../utils.js';
import { usePrevious } from '../../hooks/';

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

const ItemsNode = memo(props => {
	const { isPickerMode, parentCollectionKey, selectedCollectionKey, itemsSource,
		selectNode, shouldBeTabbable, ...rest } = props;
	const id = useRef(getUniqueId());
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const label = parentCollectionKey ? 'Items' : 'All Items';

	const isSelected = !isSingleColumn && !['trash', 'publications', 'query'].includes(itemsSource) && (
		parentCollectionKey === selectedCollectionKey || (!parentCollectionKey && !selectedCollectionKey)
	);

	const handleSelect = useCallback(() => {
		selectNode({
			view: 'item-list',
			collection: parentCollectionKey
		});
	}, [parentCollectionKey, selectNode]);

	if(isPickerMode || !isTouchOrSmall) {
		return null;
	}

	return (
		<Node
			aria-labelledby={ id.current }
			className={ cx({ 'selected': isSelected })}
			tabIndex={ shouldBeTabbable ? "-2" : null }
			onSelect={ handleSelect }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
		>
			<Icon type="28/document" className="touch" width="28" height="28" />
			<Icon type="16/document" className="mouse" width="16" height="16" />
			<div
				className="truncate"
				title={ label }
				id={ id.current }
			>
				{ label }
			</div>
		</Node>
	);
});

ItemsNode.propTypes = {
	isPickerMode: PropTypes.bool,
	itemsSource: PropTypes.string,
	parentCollectionKey: PropTypes.string,
	selectedCollectionKey: PropTypes.string,
	selectNode: PropTypes.func,
	shouldBeTabbable: PropTypes.bool,
}

ItemsNode.displayName = 'ItemsNode';


const VirtualCollectionNode = memo(props => {
	const {  cancelAdd, commitAdd, focusBySelector, isPickerMode, parentCollectionKey,
	parentLibraryKey, virtual, } = props;
	const shouldIgnoreNextBlur = useRef(false);

	const handleEditableCommit = useCallback((newValue, hasChanged, ev) => {
		const upNode = parentCollectionKey ?
			ev.currentTarget.closest('.level-root').querySelector(`[data-collection-key="${parentCollectionKey}"`) :
			null;
		const rootNode = ev.currentTarget.closest('.level-root').querySelector(`[data-key=${parentLibraryKey}]`);
		commitAdd(parentLibraryKey, parentCollectionKey, newValue);
		shouldIgnoreNextBlur.current = true;
		focusBySelector(upNode ?? rootNode);
		shouldIgnoreNextBlur.current = false;

	}, [focusBySelector, commitAdd, parentCollectionKey, parentLibraryKey]);

	const handleBlur = useCallback(() => {
		return shouldIgnoreNextBlur.current;
	}, []);

	if(isPickerMode || !virtual) {
		return null;
	}

	if(virtual.collectionKey !== parentCollectionKey) {
		return null;
	}

	return (
		<Node className={ cx({ 'new-collection': true })}>
			<Icon type="28/folder" className="touch" width="28" height="28" />
			<Icon type="16/folder" className="mouse" width="16" height="16" />
			<Editable
				autoFocus
				isActive={ true }
				isBusy={ virtual.isBusy }
				onBlur={ handleBlur }
				onCancel={ cancelAdd }
				onCommit={ handleEditableCommit }
				value=""
			/>
		</Node>
	);
});

VirtualCollectionNode.propTypes = {
	cancelAdd: PropTypes.func,
	commitAdd: PropTypes.func,
	focusBySelector: PropTypes.func,
	isPickerMode: PropTypes.bool,
	parentCollectionKey: PropTypes.string,
	parentLibraryKey: PropTypes.string,
	virtual: PropTypes.object,
};

VirtualCollectionNode.displayName = 'VirtualCollectionNode';

const PublicationsNode = memo(({ isMyLibrary, isPickerMode, isSelected, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const id = useRef(getUniqueId());

	const handleSelect = useCallback(() => {
		selectNode({ publications: true });
	}, [selectNode]);

	if(!isMyLibrary || isPickerMode) {
		return null;
	}

	return (
		<Node
			aria-labelledby={ id.current }
			className={ cx({
				'publications': true,
				'selected': isSelected
			})}
			tabIndex={ shouldBeTabbable ? "-2" : null }
			onSelect={ handleSelect }
			dndData={ { 'targetType': 'publications', libraryKey: parentLibraryKey } }
			isFileUploadAllowed={ false }
			isReadOnly={ true }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
		>
			<Icon type="28/document" className="touch" width="28" height="28" />
			<Icon type="16/document" className="mouse" width="16" height="16" />
			<div
				className="truncate"
				id={ id.current }
				title="My Publications"
			>
				My Publications
			</div>
		</Node>
	);
});

PublicationsNode.propTypes = {
	isMyLibrary: PropTypes.bool,
	isPickerMode: PropTypes.bool,
	isSelected: PropTypes.bool,
	parentLibraryKey: PropTypes.string,
	selectNode: PropTypes.func,
	shouldBeTabbable: PropTypes.bool,
};

PublicationsNode.displayName = 'PublicationsNode';

const TrashNode = memo(({ isPickerMode, isReadOnly, isSelected, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const id = useRef(getUniqueId());

	const handleSelect = useCallback(() => {
		selectNode({ trash: true });
	}, [selectNode]);

	if(isReadOnly || isPickerMode) {
		return null;
	}

	return (
		<Node
			aria-labelledby={ id.current }
			className={ cx({
				'trash': true,
				'selected': isSelected
			})}
			tabIndex={ shouldBeTabbable ? "-2" : null }
			onSelect={ handleSelect }
			isFileUploadAllowed={ false }
			isReadOnly={ true }
			dndData={ { 'targetType': 'trash', libraryKey: parentLibraryKey } }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
		>
			<Icon type="28/trash" className="touch" width="28" height="28" />
			<Icon type="16/trash" className="mouse" width="16" height="16" />
			<div className="truncate" data-trash title="Trash" id={ id.current } >Trash</div>
		</Node>
	);
});

TrashNode.propTypes = {
	isPickerMode: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	parentLibraryKey: PropTypes.string,
	selectNode: PropTypes.func,
	shouldBeTabbable: PropTypes.bool,
};

TrashNode.displayName = 'TrashNode';

const LevelWrapper = forwardRef(({ children, level, hasOpen, isLastLevel }, ref) => {
	return (
		<div ref={ ref } className={ cx('level', `level-${level}`, {
			'has-open': hasOpen, 'level-last': isLastLevel
		}) }>
			<ul className="nav" role="group">
				{ children }
			</ul>
		</div>
	);
});

LevelWrapper.displayName = 'LevelWrapper';

LevelWrapper.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	hasOpen: PropTypes.bool,
	isLastLevel: PropTypes.bool,
	level: PropTypes.number,
};


const DotMenu = memo(props => {
	const { collection, dotMenuFor, focusBySelector, opened, parentLibraryKey, setDotMenuFor, setOpened, setRenaming,
		addVirtual } = props;
	const dispatch = useDispatch();
	const currentLibraryKey = useSelector(state => state.current.libraryKey);
	const currentCollectionKey = useSelector(state => state.current.collectionKey);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	const isOpen = dotMenuFor === collection.key;

	const closeOnXArrowKey = useCallback(ev => {
		if(ev.type === 'keydown' && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
			setDotMenuFor(null);
			return true;
		}
		return false;
	}, [setDotMenuFor])

	const handleToggle = useCallback(ev => {
		setDotMenuFor(isOpen ? null : collection.key);
		if(ev.type === 'click') {
			ev.stopPropagation();
		}
	}, [collection, isOpen, setDotMenuFor]);

	const handleRenameClick = useCallback(ev => {
		if(closeOnXArrowKey(ev)) {
			return;
		}
		if(!isTriggerEvent(ev)) {
			return;
		}

		if(isTouchOrSmall) {
			dispatch(toggleModal(COLLECTION_RENAME, true, { collectionKey: collection.key }));
		} else {
			setTimeout(() => {
				setRenaming(collection.key);
			}, 100);
		}
	}, [closeOnXArrowKey, collection, dispatch, isTouchOrSmall, setRenaming]);

	const handleDeleteClick = useCallback(ev => {
		if(closeOnXArrowKey(ev)) {
			return;
		}
		if(!isTriggerEvent(ev)) {
			return;
		}
		const upNode = collection.parentCollection ?
			ev.currentTarget.closest('.level-root').querySelector(`[data-collection-key="${collection.parentCollection}"`) :
			null;
		const rootNode = ev.currentTarget.closest('.level-root').querySelector(`[data-key=${parentLibraryKey}]`);

		setTimeout(() => {
			focusBySelector(upNode ?? rootNode);
		}, 0);

		dispatch(deleteCollection(collection, parentLibraryKey));

		if(currentLibraryKey === parentLibraryKey && collection.key === currentCollectionKey) {
			if(collection.parentCollection) {
				dispatch(navigate({ library: currentLibraryKey, collection: collection.parentCollection }, true));
			} else {
				dispatch(navigate({ library: currentLibraryKey }, true));
			}
		}
	}, [closeOnXArrowKey, dispatch, focusBySelector, collection, parentLibraryKey, currentLibraryKey, currentCollectionKey]);

	const handleSubcollectionClick = useCallback(ev => {
		if(closeOnXArrowKey(ev)) {
			return;
		}
		if(!isTriggerEvent(ev)) {
			return;
		}
		ev.stopPropagation();
		if(isTouchOrSmall) {
			dispatch(toggleModal(COLLECTION_ADD, true, { parentCollectionKey: collection.key }));
		} else {
			setTimeout(() => {
				setOpened([...opened, collection.key ]);
				addVirtual(parentLibraryKey, collection.key);
			}, 0);
		}
	}, [addVirtual, closeOnXArrowKey, collection, dispatch, isTouchOrSmall, opened, parentLibraryKey, setOpened]);

	const handleMoveCollectionClick = useCallback(ev => {
		if(closeOnXArrowKey(ev)) {
			return;
		}
		if(!isTriggerEvent(ev)) {
			return;
		}
		dispatch(toggleModal( MOVE_COLLECTION, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } ));
	}, [closeOnXArrowKey, collection, dispatch, parentLibraryKey]);

	// disabled, because of 100 items limit https://github.com/zotero/web-library/issues/367
	// const handleExportClick = useCallback(() => {
	// 	dispatch(toggleModal(EXPORT, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } ));
	// });

	// const handleBibliographyClick = useCallback(() => {
	// 	dispatch(toggleModal(BIBLIOGRAPHY, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } ));
	// });

	return (
		<Dropdown
			isOpen={ isOpen }
			onToggle={ handleToggle }
			placement="bottom-end"
		>
			<DropdownToggle
				tabIndex={ -3 }
				className="btn-icon dropdown-toggle"
				title="More"
				onMouseDown={ stopPropagation }
				onClick={ handleToggle }
			>
				<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
				<Icon type={ '16/options' } width="16" height="16" className="mouse" />
			</DropdownToggle>
			<DropdownMenu>
				<React.Fragment>
				<DropdownItem
					onBlur={ stopPropagation }
					onMouseDown={ stopPropagation }
					onClick={ handleRenameClick }
					onKeyDown={ handleRenameClick }
				>
					Rename
				</DropdownItem>
				<DropdownItem
					onBlur={ stopPropagation }
					onMouseDown={ stopPropagation }
					onClick={ handleDeleteClick }
					onKeyDown={ handleDeleteClick }
				>
					Delete
				</DropdownItem>
				<DropdownItem
					onBlur={ stopPropagation }
					onMouseDown={ stopPropagation }
					onClick={ handleSubcollectionClick }
					onKeyDown={ handleSubcollectionClick }
				>
					New Subcollection
				</DropdownItem>
					<DropdownItem
						onBlur={ stopPropagation }
						onMouseDown={ stopPropagation }
						onClick={ handleMoveCollectionClick }
						onKeyDown={ handleMoveCollectionClick }
					>
						Move Collection
					</DropdownItem>
				</React.Fragment>
			</DropdownMenu>
		</Dropdown>
	);
});

DotMenu.propTypes = {
	addVirtual: PropTypes.func,
	collection: PropTypes.object,
	dotMenuFor: PropTypes.string,
	focusBySelector: PropTypes.func,
	isReadOnly: PropTypes.bool,
	opened: PropTypes.array,
	parentLibraryKey: PropTypes.string,
	setDotMenuFor: PropTypes.func,
	setOpened: PropTypes.func,
	setRenaming: PropTypes.func,
};

DotMenu.displayName = 'DotMenu';

const PickerCheckbox = memo(({ collectionKey, pickerPick, picked, parentLibraryKey }) => {
	const handleChange = useCallback(() => {
		pickerPick({ collectionKey, libraryKey: parentLibraryKey });
	}, [collectionKey, parentLibraryKey, pickerPick]);

	const isChecked = useMemo(() =>
		picked.some(({ collectionKey: c, libraryKey: l }) => l === parentLibraryKey && c === collectionKey),
		[collectionKey, picked, parentLibraryKey]
	);

	return (
		<input
			checked={ isChecked }
			onChange={ handleChange }
			onClick={ stopPropagation }
			onMouseDown={ stopPropagation }
			tabIndex={ -1 }
			type="checkbox"
		/>
	);
});

PickerCheckbox.propTypes = {
	collectionKey: PropTypes.string,
	parentLibraryKey: PropTypes.string,
	picked: PropTypes.array,
	pickerPick: PropTypes.func,
};

PickerCheckbox.displayName = 'PickerCheckbox';

const CollectionNode = memo(props => {
	const { allCollections, disabledCollections, derivedData, collection, level, getParents,
		selectedCollectionKey, isCurrentLibrary, parentLibraryKey, renaming, selectNode, setRenaming,
		virtual, isFileUploadAllowed, isPickerMode, isReadOnly, onOpen, shouldBeTabbable, picked = [],
		pickerPick, pickerSkipCollections, ...rest }  = props;
	const dispatch = useDispatch();
	const id = useRef(getUniqueId('tree-node-'));
	const updating = useSelector(state => parentLibraryKey in state.libraries ? state.libraries[parentLibraryKey].updating.collections : {});
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const highlightedCollections = useSelector(state => state.current.highlightedCollections);
	const isHighlighted = highlightedCollections.includes(collection.key);
	const prevRenaming = usePrevious(renaming);
	const inputRef = useRef(null);

	// cannot be picked if isPickerSkip
	const isPickerSkip = isPickerMode && pickerSkipCollections && pickerSkipCollections.includes(collection.key);

	// cannot be opened if isDisabled
	const isDisabled = disabledCollections && disabledCollections.includes(collection.key);

	const handleSelect = useCallback(() => {
		if(isPickerMode && !isPickerSkip && !isTouchOrSmall) {
			pickerPick({ collectionKey: collection.key, libraryKey: parentLibraryKey });
		} else if(!isDisabled) {
			selectNode({ collection: collection.key });
		}
	}, [collection, isDisabled, isTouchOrSmall, isPickerMode, isPickerSkip, parentLibraryKey, pickerPick, selectNode]);

	const handleRenameTrigger = useCallback(() => {
		if(isTouchOrSmall || isReadOnly || isPickerMode) {
			return;
		}
		setRenaming(collection.key);
	}, [collection, isPickerMode, isReadOnly, isTouchOrSmall, setRenaming]);

	const handleRenameCancel = useCallback(() => {
		setRenaming(null);
	}, [setRenaming]);

	const handleRenameCommit = useCallback((newValue, hasChanged, ev) => {
		ev.currentTarget.closest('[data-collection-key]').focus();

		if(!hasChanged || newValue === '' || (collection.name === newValue)) {
			setRenaming(null);
			return;
		}

		try {
			dispatch(updateCollection(collection.key, { name: newValue }, parentLibraryKey));
		} finally {
			setRenaming(null);
		}
	}, [collection, dispatch, parentLibraryKey, setRenaming]);

	const handleRenameKeyDown = useCallback(ev => {
		ev.stopPropagation();
	}, []);

	const handleNodeDrop = useCallback((src, target) => {
		const patch = {
			parentCollection: target.collectionKey || false
		};
		if(src.libraryKey === target.libraryKey) {
			dispatch(updateCollection(src.collectionKey, patch, src.libraryKey));
		} else {
			//@TODO: Support for moving collections across libraries #227
		}
	}, [dispatch]);

	const handleFileDrop = useCallback(async droppedFiles => {
		await dispatch(createAttachmentsFromDropped(droppedFiles, { libraryKey: parentLibraryKey, collection: collection.key }));
	}, [collection, dispatch, parentLibraryKey]);

	const handleNodeKeyDown = useCallback(ev => {
		if(isPickerMode && !isPickerSkip && isTriggerEvent(ev)) {
			pickerPick({ collectionKey: collection.key, libraryKey: parentLibraryKey });
			ev.preventDefault();
		}
	}, [collection, pickerPick, isPickerMode, isPickerSkip, parentLibraryKey]);

	const handleOpen = useCallback(ev => {
		if(isDisabled) {
			return;
		}
		return onOpen(ev);
	}, [isDisabled, onOpen])

	const usesItemsNode = isSingleColumn && !isPickerMode;

	const collections = allCollections.filter(c => c.parentCollection === collection.key );
	const hasSubCollections = collections.length > 0;
	const hasSubCollectionsOrItemsNode = hasSubCollections || usesItemsNode;
	const { selectedDepth } = derivedData[collection.key];

	const selectedHasChildren = isCurrentLibrary && selectedCollectionKey && (derivedData[selectedCollectionKey] || {}).hasChildren;

	// if isSelected is a nested child, hasOpen is true
	// if isSelected is a direct child, hasOpen is only true if
	// either selected is not a leaf node or we're in singleColumn mode (where there is always estra "Items" node)
	const hasOpen = selectedDepth > 0 && !(selectedDepth === 1 && (!selectedHasChildren && !usesItemsNode));

	// at least one collection contains subcollections
	const hasNested = !!collections.find(c => derivedData[c.key].hasChildren);

	// on mobiles, there is extra level that only contains "items" (but not in picker mode)
	const isLastLevel = usesItemsNode ? collections.length === 0 : !hasNested;


	// subtree nodes are tabbable if
	const shouldSubtreeNodesBeTabbableOnTouch = isCurrentLibrary && derivedData[collection.key].isSelected ||
		selectedDepth === 1 && !selectedHasChildren;
	const shouldSubtreeNodesBeTabbable = shouldSubtreeNodesBeTabbableOnTouch || !isTouchOrSmall;

	const collectionName = collection.key in updating ?
		updating[collection.key]?.[updating[collection.key].length - 1]?.patch.name || collection.name :
		collection.name

	const hasVirtual = virtual && virtual.collectionKey === collection.key;

	//optimsation: skips rendering subtrees that are not visible nor relevant for transitions
	const shouldRenderSubtree = !isDisabled && (
		(isTouchOrSmall && (shouldSubtreeNodesBeTabbableOnTouch || selectedDepth !== -1)) ||
		(!isTouchOrSmall && derivedData[collection.key].isOpen)
	);

	const isPicked = picked.some(({ collectionKey: c, libraryKey: l }) => l === parentLibraryKey && c === collection.key);

	useEffect(() => {
		if(prevRenaming === null && renaming === collection.key && inputRef.current.focus) {
			inputRef.current.focus();
		}
	}, [collection.key, renaming, prevRenaming]);

	return (
		<Node
			className={ cx({
				'open': derivedData[collection.key].isOpen,
				'selected': !isPickerMode && derivedData[collection.key].isSelected,
				'picked': isPickerMode && isPicked,
				'picker-skip': isPickerSkip,
				'disabled': isDisabled,
				'collection': true,
			})}
			aria-labelledby={ id.current }
			data-collection-key={ collection.key }
			dndData={ { 'targetType': 'collection', collectionKey: collection.key, libraryKey: parentLibraryKey, getParents } }
			isFileUploadAllowed={ isFileUploadAllowed }
			isOpen={ derivedData[collection.key].isOpen }
			isReadOnly={ isReadOnly }
			onSelect={ handleSelect }
			onNodeDrop={ isTouchOrSmall ? null : handleNodeDrop }
			onFileDrop={ isTouchOrSmall ? null : handleFileDrop }
			onOpen={ handleOpen }
			onRename={ isTouchOrSmall ? null : handleRenameTrigger }
			onRenameCancel={ isTouchOrSmall ? null : handleRenameCancel }
			onKeyDown={ handleNodeKeyDown }
			shouldBeDraggable={ !isPickerMode && renaming !== collection.key }
			showTwisty={ hasSubCollections && !isDisabled }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			{ ...pick(rest, ['onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev']) }
			subtree={ (shouldRenderSubtree && (hasSubCollectionsOrItemsNode || hasVirtual)) ? (
				<LevelWrapper hasOpen={ hasOpen } level={ level } isLastLevel={ isLastLevel }>
					<CollectionsNodeList
						{ ...omit(props, ['level', 'collection', 'shouldBeTabbable']) }
						collections = { collections }
						level={ level + 1 }
						parentCollectionKey={ collection.key }
						shouldBeTabbable = { shouldSubtreeNodesBeTabbable }
					/>
				</LevelWrapper>
			) : null }
		>
			<Icon type={ hasSubCollections ? '28/folders' : '28/folder' } className="touch" width="28" height="28" />
			<Icon
				type={ '16/folder' }
				symbol={ isHighlighted ? 'folder-block' : 'folder' }
				className="mouse"
				width="16"
				height="16"
			/>
			{ renaming === collection.key ? (
				<Editable
					isActive={ true }
					isBusy={ false }
					onBlur={ () => false /* commit on blur */ }
					onCancel={ handleRenameCancel }
					onCommit={ handleRenameCommit }
					onKeyDown={ handleRenameKeyDown }
					ref={ inputRef }
					selectOnFocus
					value={ collectionName }
				/> ) : (
					<React.Fragment>
						<div
							className="truncate"
							id={ id.current }
							title={ collectionName }
						>
							{ collectionName }
						</div>
						{ (isPickerMode && !isReadOnly && !isPickerSkip && isTouchOrSmall) ? (
							<PickerCheckbox
								collectionKey = { collection.key }
								parentLibraryKey = { parentLibraryKey }
								pickerPick = { pickerPick }
								picked={ picked }
							/>
						) : (!isReadOnly && !isPickerMode) ? (
							<DotMenu
								collection = { collection }
								setRenaming = { setRenaming }
								parentLibraryKey = { parentLibraryKey }
								{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd',
								'dotMenuFor', 'focusBySelector', 'onFocusNext', 'opened',
								'setDotMenuFor', 'setOpened']) }
							/>
						) : null }
					</React.Fragment>
				)
			}
		</Node>
	);
});

CollectionNode.propTypes = {
	allCollections: PropTypes.array,
	collection: PropTypes.object,
	derivedData: PropTypes.object,
	disabledCollections: PropTypes.array,
	getParents: PropTypes.func,
	isCurrentLibrary: PropTypes.bool,
	isFileUploadAllowed: PropTypes.bool,
	isPickerMode: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	level: PropTypes.number,
	onOpen: PropTypes.func,
	parentLibraryKey: PropTypes.string,
	picked: PropTypes.array,
	pickerPick: PropTypes.func,
	pickerSkipCollections: PropTypes.array,
	renaming: PropTypes.string,
	selectedCollectionKey: PropTypes.string,
	selectNode: PropTypes.func,
	setRenaming: PropTypes.func,
	shouldBeTabbable: PropTypes.bool,
	virtual: PropTypes.object,
};

CollectionNode.displayName = 'CollectionNode';

const CollectionsNodeList = memo(({ collections, parentCollectionKey, ...rest }) => {
	const sortedFilteredCollections = useMemo(() => {
		const sortedCollections = [ ...collections ];

		sortedCollections.sort((c1, c2) =>
			c1.name.toUpperCase().localeCompare(c2.name.toUpperCase())
		);
		return sortedCollections;
	}, [collections]);

	return (
		<React.Fragment>
			<ItemsNode
				parentCollectionKey={ parentCollectionKey }
				{  ...pick(rest, ['isPickerMode', 'itemsSource', 'onFocusNext', 'onFocusPrev',
				'parentCollectionKey', 'selectedCollectionKey', 'selectNode', 'shouldBeTabbable']) }
			/>
			{ sortedFilteredCollections.map(c =>
				<CollectionNode
					key={ c.key }
					collection={ c }
					parentCollectionKey={ parentCollectionKey }
					{ ...pick(rest, [ 'addVirtual', 'allCollections', 'cancelAdd', 'collection',
					'commitAdd', 'derivedData', 'dotMenuFor', 'disabledCollections',
					'focusBySelector', 'getParents', 'isCurrentLibrary', 'isPickerMode',
					'isFileUploadAllowed', 'isReadOnly', 'level', 'onDrillDownNext', 'onDrillDownPrev',
					'onFocusNext', 'onFocusPrev', 'onOpen', 'opened', 'parentLibraryKey',
					'pickerSkipCollections', 'picked', 'pickerPick', 'renaming', 'selectedCollectionKey',
					'selectNode', 'setDotMenuFor', 'setOpened', 'setRenaming', 'shouldBeTabbable', 'virtual',])}
				/>
			) }
			<VirtualCollectionNode
				parentCollectionKey= { parentCollectionKey }
				{ ...pick(rest, ['virtual', 'cancelAdd', 'commitAdd', 'focusBySelector',
				'parentLibraryKey', 'isPickerMode'] )}
			/>
		</React.Fragment>
	)
});

CollectionsNodeList.propTypes = {
	collections: PropTypes.array,
	parentCollectionKey: PropTypes.string,
};

CollectionsNodeList.displayName = 'CollectionsNodeList';

const CollectionTree = props => {
	const { onNodeSelected = noop, parentLibraryKey, isPickerMode, pickerNavigate = noop,
	pickerState, ...rest } = props;
	const dispatch = useDispatch();
	const levelWrapperRef = useRef(null);
	const collections = useSelector(
		state => parentLibraryKey in state.libraries ? state.libraries[parentLibraryKey].collections.data : {}
	);
	const libraries = useSelector(state => state.config.libraries);
	const isFetchingAllCollections = useSelector(
		state => parentLibraryKey in state.libraries ? state.libraries[parentLibraryKey].collections.isFetchingAll : false
	);
	const itemsSource = useSelector(state => state.current.itemsSource);
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const stateSelectedCollectionKey = useSelector(state => state.current.collectionKey);
	const selectedCollectionKey = isPickerMode ? pickerState.collectionKey : stateSelectedCollectionKey;
	const prevSelectedCollectionKey = usePrevious(selectedCollectionKey);
	const stateSelectedLibraryKey = useSelector(state => state.current.libraryKey);
	const selectedLibraryKey = isPickerMode ? pickerState.libraryKey : stateSelectedLibraryKey;
	const selectedCollection = collections[selectedCollectionKey];
	const prevSelectedCollection = usePrevious(selectedCollection);

	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isFirstRendering = useSelector(state => state.current.isFirstRendering);

	const highlightedCollections = useSelector(state => state.current.highlightedCollections);
	const prevHighlightedCollections = usePrevious(highlightedCollections);

	const isCurrentLibrary = parentLibraryKey === selectedLibraryKey;
	const usesItemsNode = isSingleColumn && !isPickerMode;
	const allCollections = useMemo(() => Object.values(collections), [collections]);

	const path = useMemo(
		() => makeCollectionsPath(selectedCollectionKey, collections, isCurrentLibrary),
		[collections, isCurrentLibrary, selectedCollectionKey]
	);

	const [opened, setOpened] = useState(path.slice(0, -1));
	const [renaming, setRenaming] = useState(null);
	const [dotMenuFor, setDotMenuFor] = useState(null);

	const getParents = useCallback((collectionKey) => {
		const parents = [];
		let parentKey = collections[collectionKey]?.parentCollection;
		while(parentKey) {
			parents.push(parentKey);
			parentKey = collections[parentKey]?.parentCollection;
		}
		return parents;
	}, [collections]);

	const toggleOpen = useCallback((collectionKey, shouldOpen = null) => {
		if(shouldOpen === null) {
			shouldOpen = !opened.includes(collectionKey);
		}

		shouldOpen ?
			setOpened([...opened, collectionKey ]) :
			setOpened(opened.filter(k => k !== collectionKey));
	}, [opened]);

	const handleOpenToggle = useCallback((ev) => {
		const collectionKey = ev.currentTarget.closest('[data-collection-key]').dataset.collectionKey;
		toggleOpen(collectionKey);
	}, [toggleOpen]);

	const selectNode = useCallback(partialPath => {
		const path = { ...partialPath, library: parentLibraryKey };
		isPickerMode ? pickerNavigate(path) : dispatch(navigate(path, true));
		onNodeSelected(path);
	}, [dispatch, isPickerMode, onNodeSelected, parentLibraryKey, pickerNavigate]);

	const ensurePathToSelectedIsOpened = useCallback(() => {
		setOpened([...opened, ...path.slice(0, -1)]);
	}, [opened, path]);

	const derivedData = useMemo(
		() => {
			return makeDerivedData(collections, path, opened, isTouchOrSmall);
		},
		[collections, isTouchOrSmall, opened, path]
	);

	const selectedDepth = path.length;
	const selectedHasChildren = isCurrentLibrary && selectedCollectionKey && (derivedData[selectedCollectionKey] || {}).hasChildren;
	const hasOpen = (selectedDepth > 0 && (selectedHasChildren || usesItemsNode)) || selectedDepth > 1;

	const topLevelCollections = allCollections.filter(c => c.parentCollection === false );
	const isLastLevel = usesItemsNode ? false : collections.length === 0;

	const shouldBeTabbableOnTouch = isCurrentLibrary && !selectedCollectionKey;
	const shouldBeTabbable = shouldBeTabbableOnTouch || !isTouchOrSmall;

	const { isFileUploadAllowed, isReadOnly, isMyLibrary } = libraries.find(l => l.key === parentLibraryKey);

	useEffect(() => {
		if(!shallowEqual(highlightedCollections, prevHighlightedCollections)) {
			const parentsOfHighlighted = highlightedCollections.reduce((acc, cKey) => {
				do {
					cKey = cKey in collections ? collections[cKey].parentCollection : null;
					if(cKey) {
						acc.push(cKey);
					}
				} while(cKey);
				return acc;
			}, []);

			if(parentsOfHighlighted.length > 0) {
				setOpened([...opened,  ...parentsOfHighlighted]);
			}
		}
	}, [collections, highlightedCollections, opened, prevHighlightedCollections]);

	useEffect(() => {
		if(selectedCollectionKey !== prevSelectedCollectionKey) {
			// ignore selected collection key
			return;
		}
		if(selectedCollection?.parentCollection !== prevSelectedCollection?.parentCollection) {
			ensurePathToSelectedIsOpened();
		}
	}, [ensurePathToSelectedIsOpened, prevSelectedCollection, selectedCollection, selectedCollectionKey, prevSelectedCollectionKey]);

	useEffect(() => {
		if(isFirstRendering && !isPickerMode && !isTouchOrSmall) {
			let targetEl = null;

			if(selectedCollectionKey) {
				targetEl = levelWrapperRef.current?.querySelector(`[data-collection-key="${selectedCollectionKey}"]`);
			} else if(isTrash) {
				targetEl = levelWrapperRef.current?.querySelector('[data-trash]');
			}

			if(targetEl) {
				targetEl.scrollIntoView();
			}
		}
		// detect if URL contains non-existing collection key and redirect if it does
		if(!isPickerMode && stateSelectedCollectionKey && !(stateSelectedCollectionKey in collections)) {
			dispatch(navigate({ library: stateSelectedLibraryKey, view: 'library' }, true));
		}
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	if(isFetchingAllCollections) {
		// while fetching collections:
		// On touch we allow animating into next level and render a spinner
		if(isTouchOrSmall) {
			return (
				<div className="level level-1 level-last loading">
					<Spinner className="large" />
				</div>
			);
		}
		// On desktop no need to render anything, spinner shows next to the library node
		return null;
	}

	return (
		<LevelWrapper ref={ levelWrapperRef } level={ 1 } hasOpen={ hasOpen } isLastLevel={ isLastLevel }>
			<CollectionsNodeList
				allCollections={ allCollections }
				collections={ topLevelCollections }
				derivedData={ derivedData }
				dotMenuFor={ dotMenuFor }
				isCurrentLibrary = { isCurrentLibrary }
				isFileUploadAllowed={ isFileUploadAllowed }
				isPickerMode={ isPickerMode }
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
				shouldBeTabbable={ shouldBeTabbable }
				getParents ={ getParents }
				{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd', 'disabledCollections',
				'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'focusBySelector', 'picked',
				'pickerPick', 'pickerSkipCollections', 'virtual']) }
			/>
			<PublicationsNode
				isMyLibrary = { isMyLibrary }
				isPickerMode={ isPickerMode }
				isSelected = { isCurrentLibrary && isMyPublications }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				{ ...pick(rest, ['onDrillDownNext', 'onDrillDownPrev',
				'onFocusNext', 'onFocusPrev']) }
			/>
			<TrashNode
				isPickerMode={ isPickerMode }
				isReadOnly = { isReadOnly }
				isSelected = { isCurrentLibrary && isTrash }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				{ ...pick(rest, ['onDrillDownNext', 'onDrillDownPrev',
				'onFocusNext', 'onFocusPrev']) }
			/>
		</LevelWrapper>
	);
};

CollectionTree.propTypes = {
	isPickerMode: PropTypes.bool,
	onNodeSelected: PropTypes.func,
	parentLibraryKey: PropTypes.string,
	pickerNavigate: PropTypes.func,
	pickerState: PropTypes.object,
};

export default memo(CollectionTree);

import cx from 'classnames';
import PropTypes from 'prop-types';
import { Fragment, memo, forwardRef, useMemo, useState, useCallback, useRef, useEffect, } from 'react';
import { flushSync } from 'react-dom';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Icon, Spinner } from 'web-common/components';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { usePrevious } from 'web-common/hooks';
import { isTriggerEvent, noop, omit, pick } from 'web-common/utils';

import Editable from '../editable';
import Node from './node';
import { BIBLIOGRAPHY, COLLECTION_RENAME, COLLECTION_ADD, MOVE_COLLECTION } from '../../constants/modals';
import { createAttachmentsFromDropped, toggleModal, updateCollection, updateCollectionsTrash, navigate } from '../../actions';
import { setModalFocusRestore } from '../../common/modal-focus-restore';
import { stopPropagation, getUniqueId } from '../../utils.js';
import { PICKS_SINGLE_COLLECTION, PICKS_MULTIPLE_COLLECTIONS, PICKS_SINGLE_ITEM, PICKS_MULTIPLE_ITEMS } from '../../constants/picker-modes';

const makeDerivedData = (collections = {}, path = [], opened, isTouchOrSmall) => {
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
	const { pickerMode, level, parentCollectionKey, selectedCollectionKey, itemsSource,
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

	if ([PICKS_SINGLE_COLLECTION, PICKS_MULTIPLE_COLLECTIONS].includes(pickerMode) || !isTouchOrSmall) {
		return null;
	}

	return (
		<Node
			aria-labelledby={ id.current }
			aria-selected={ isSelected }
			aria-level={ level }
			className={ cx({
				'items-node': true,
				'selected': isSelected,
			})}
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
	pickerMode: PropTypes.number,
    itemsSource: PropTypes.string,
    level: PropTypes.number,
    parentCollectionKey: PropTypes.string,
    selectedCollectionKey: PropTypes.string,
    selectNode: PropTypes.func,
    shouldBeTabbable: PropTypes.bool
}

ItemsNode.displayName = 'ItemsNode';


const VirtualCollectionNode = memo(props => {
	const { cancelAdd, commitAdd, focusBySelector, pickerMode, level, parentCollectionKey,
	parentLibraryKey, virtual, } = props;
	const shouldIgnoreNextBlur = useRef(false);

	const handleEditableCommit = useCallback(async (newValue) => {
		shouldIgnoreNextBlur.current = true;
		const newCollection = await commitAdd(parentLibraryKey, parentCollectionKey, newValue);
		if (newCollection) {
			setTimeout(() => {
				focusBySelector(`[data-collection-key="${newCollection.key}"]`);
			}, 0);
		}
	}, [focusBySelector, commitAdd, parentCollectionKey, parentLibraryKey]);

	const handleBlur = useCallback(() => {
		return shouldIgnoreNextBlur.current;
	}, []);

	const handleCancel = useCallback((_hasChanged, ev) => {
		const inputEl = ev.currentTarget;
		const levelRoot = inputEl?.closest('.level-root');
		let focusTarget = null;

		if (levelRoot) {
			if (parentCollectionKey) {
				// Subcollection: focus the "More" dropdown toggle on parent collection
				const parentNode = levelRoot.querySelector(
					`[data-collection-key="${parentCollectionKey}"]`
				);
				focusTarget = parentNode?.querySelector('.dropdown-toggle');
			} else {
				// Top-level: focus the "+" button on library node
				const libraryNode = levelRoot.querySelector(
					`[data-key="${parentLibraryKey}"]`
				);
				focusTarget = libraryNode?.querySelector('.btn-icon-plus');
			}
		}

		cancelAdd();

		if (focusTarget) {
			// Defer focus to after Input's Escape handler finishes setting
			// hasBeenCancelled and calling blur(). Synchronous focus here would
			// cause a re-entrant blur -> commit cycle.
			// Visibility trick needed because these buttons are hidden when
			// their parent .item-container lacks :focus-within.
			setTimeout(() => {
				focusTarget.style.setProperty('visibility', 'visible');
				focusBySelector(focusTarget);
				focusTarget.style.removeProperty('visibility');
			}, 0);
		}
	}, [cancelAdd, focusBySelector, parentCollectionKey, parentLibraryKey]);

	if (pickerMode || !virtual) {
		return null;
	}

	if(virtual.collectionKey !== parentCollectionKey) {
		return null;
	}

	return (
		<Node
			aria-level={ level }
			className={ cx({ 'new-collection': true })}
		>
			<Icon type="28/folder" className="touch" width="28" height="28" />
			<Icon type="16/folder" className="mouse" width="16" height="16" />
			<Editable
				aria-label="New Collection"
				autoFocus
				isActive={ true }
				isBusy={ virtual.isBusy }
				onBlur={ handleBlur }
				onCancel={ handleCancel }
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
	pickerMode: PropTypes.number,
	level: PropTypes.number,
	parentCollectionKey: PropTypes.string,
	parentLibraryKey: PropTypes.string,
	virtual: PropTypes.object,
};

VirtualCollectionNode.displayName = 'VirtualCollectionNode';

const PublicationsNode = memo(({ isMyLibrary, pickerMode, isSelected, level, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const id = useRef(getUniqueId());

	const handleSelect = useCallback(() => {
		selectNode({ publications: true });
	}, [selectNode]);

	if (!isMyLibrary || pickerMode) {
		return null;
	}

	return (
		<Node
			aria-labelledby={ id.current }
			aria-selected={ isSelected }
			aria-level={ level }
			className={ cx({
				'publications': true,
				'selected': isSelected,
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
	pickerMode: PropTypes.number,
    isSelected: PropTypes.bool,
    level: PropTypes.number,
    parentLibraryKey: PropTypes.string,
    selectNode: PropTypes.func,
    shouldBeTabbable: PropTypes.bool
};

PublicationsNode.displayName = 'PublicationsNode';

const TrashNode = memo(({ pickerMode, isReadOnly, isSelected, level, shouldBeTabbable, parentLibraryKey, selectNode, ...rest }) => {
	const id = useRef(getUniqueId());

	const handleSelect = useCallback(() => {
		selectNode({ trash: true });
	}, [selectNode]);

	if (isReadOnly || pickerMode) {
		return null;
	}

	return (
		<Node
			aria-labelledby={ id.current }
			aria-selected={ isSelected }
			aria-level={ level }
			className={ cx({
				'trash': true,
				'selected': isSelected,
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
	pickerMode: PropTypes.number,
    isReadOnly: PropTypes.bool,
    isSelected: PropTypes.bool,
    level: PropTypes.number,
    parentLibraryKey: PropTypes.string,
    selectNode: PropTypes.func,
    shouldBeTabbable: PropTypes.bool
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
	const { collection, dotMenuFor, focusBySelector, isReadOnly, opened, parentLibraryKey, setDotMenuFor, setOpened, setRenaming,
		addVirtual } = props;
	const dispatch = useDispatch();
	const toggleRef = useRef(null);
	const currentLibraryKey = useSelector(state => state.current.libraryKey);
	const currentCollectionKey = useSelector(state => state.current.collectionKey);
	const hasItems = useSelector(state => (state.libraries[parentLibraryKey]?.itemsByCollection?.[collection.key]?.totalResults ?? Infinity) > 0); // This should always be known but if we somehow don't know, we assume collection has items
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);

	const isOpen = dotMenuFor === collection.key;

	const handleDropdownMenuKeyDown = useCallback(ev => {
		if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
			ev.preventDefault();
			ev.stopPropagation();
			setDotMenuFor(null);
			focusBySelector(`[data-collection-key="${collection.key}"]`);
		}
	}, [collection.key, focusBySelector, setDotMenuFor]);

	// Stop blur propagation only when focus stays within the dropdown menu.
	const handleDropdownItemBlur = useCallback(ev => {
		const menu = ev.currentTarget.closest('[role="menu"]');
		if (menu?.contains(ev.relatedTarget)) {
			ev.stopPropagation();
		}
	}, []);

	const handleToggle = useCallback(ev => {
		setDotMenuFor(isOpen ? null : collection.key);
		if(ev.type === 'click') {
			ev.stopPropagation();
		}
	}, [collection.key, isOpen, setDotMenuFor]);

	const handleRenameClick = useCallback(ev => {
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
	}, [collection, dispatch, isTouchOrSmall, setRenaming]);

	const handleDeleteClick = useCallback(ev => {
		if(!isTriggerEvent(ev)) {
			return;
		}
		const selector = collection.parentCollection ?
			`[data-collection-key="${collection.parentCollection}"]` :
			`[data-key="${parentLibraryKey}"]`;

		setTimeout(() => {
			focusBySelector(selector);
		}, 0);

		dispatch(updateCollectionsTrash([collection.key], parentLibraryKey, 1));

		if(currentLibraryKey === parentLibraryKey && collection.key === currentCollectionKey) {
			if(collection.parentCollection) {
				dispatch(navigate({ library: currentLibraryKey, collection: collection.parentCollection }, true));
			} else {
				dispatch(navigate({ library: currentLibraryKey }, true));
			}
		}
	}, [dispatch, focusBySelector, collection, parentLibraryKey, currentLibraryKey, currentCollectionKey]);

	const handleSubcollectionClick = useCallback(ev => {
		if(!isTriggerEvent(ev)) {
			return;
		}
		ev.stopPropagation();

		if(isTouchOrSmall) {
			dispatch(toggleModal(COLLECTION_ADD, true, { parentCollectionKey: collection.key }));
		} else {
			// close the dot menu and open the collection synchroneusly so it doesn't interfere with focus
			flushSync(() => {
				setDotMenuFor(null);
				setOpened([...opened, collection.key]);
			});
			addVirtual(parentLibraryKey, collection.key);
		}
	}, [addVirtual, collection.key, dispatch, isTouchOrSmall, opened, parentLibraryKey, setDotMenuFor, setOpened]);

	const handleMoveCollectionClick = useCallback(ev => {
		if(!isTriggerEvent(ev)) {
			return;
		}
		setModalFocusRestore(toggleRef.current);
		setDotMenuFor(null);
		dispatch(toggleModal( MOVE_COLLECTION, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } ));
	}, [collection, dispatch, parentLibraryKey, setDotMenuFor]);

	// disabled, because of 100 items limit https://github.com/zotero/web-library/issues/367
	// const handleExportClick = useCallback(() => {
	// 	dispatch(toggleModal(EXPORT, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } ));
	// });

	const handleBibliographyClick = useCallback(() => {
		setModalFocusRestore(toggleRef.current);
		setDotMenuFor(null);
		dispatch(toggleModal(BIBLIOGRAPHY, true, { collectionKey: collection.key, libraryKey: parentLibraryKey } ));
	}, [collection.key, dispatch, parentLibraryKey, setDotMenuFor]);

	return (
		<Dropdown
			isOpen={ isOpen }
			onToggle={ handleToggle }
			placement="bottom-end"
			strategy="fixed"
			portal={ true }
		>
			<DropdownToggle
				ref={ toggleRef }
				tabIndex={ -3 }
				className="btn-icon dropdown-toggle"
				title="More"
				onMouseDown={ stopPropagation }
				onClick={ handleToggle }
			>
				<Icon type={ '24/options-sm' } width="24" height="24" className="touch" />
				<Icon type={ '16/options' } width="16" height="16" className="mouse" />
			</DropdownToggle>
			<DropdownMenu onKeyDown={handleDropdownMenuKeyDown}>
				<Fragment>
				<DropdownItem
					disabled={isReadOnly}
					onBlur={ handleDropdownItemBlur }
					onMouseDown={ stopPropagation }
					onClick={ handleRenameClick }
				>
					Rename
				</DropdownItem>
				<DropdownItem
					disabled={isReadOnly}
					onBlur={ handleDropdownItemBlur }
					onMouseDown={ stopPropagation }
					onClick={ handleSubcollectionClick }
				>
					New Subcollection
				</DropdownItem>
				<DropdownItem
					disabled={isReadOnly}
					onBlur={ handleDropdownItemBlur }
					onMouseDown={ stopPropagation }
					onClick={ handleMoveCollectionClick }
				>
					Move Collection
				</DropdownItem>
				<DropdownItem divider />
				<DropdownItem
					disabled={isReadOnly}
					onBlur={ handleDropdownItemBlur }
					onMouseDown={ stopPropagation }
					onClick={handleDeleteClick}
				>
					Delete
				</DropdownItem>
				<DropdownItem divider />
					<DropdownItem
						disabled={!hasItems}
						onBlur={ handleDropdownItemBlur }
						onMouseDown={ stopPropagation }
						onClick={handleBibliographyClick}
					>
						Create Bibliography
					</DropdownItem>
				</Fragment>
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
		virtual, isFileUploadAllowed, isReadOnly, onOpen, shouldBeTabbable, picked = [],
		pickerMode, pickerPick, pickerSkipCollections, ...rest }  = props;
	const dispatch = useDispatch();
	const id = useRef(getUniqueId('tree-node-'));
	const updating = useSelector(state => parentLibraryKey in state.libraries ? state.libraries[parentLibraryKey].updating.collections : {});
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const highlightedCollections = useSelector(state => state.current.highlightedCollections);
	const isHighlighted = highlightedCollections.includes(collection.key);
	const prevRenaming = usePrevious(renaming);
	const inputRef = useRef(null);
	const pickerPicksCollection = [PICKS_MULTIPLE_COLLECTIONS, PICKS_SINGLE_COLLECTION].includes(pickerMode);
	// in picker mode, collection should not be selectable, except on desktop devices where selection = picked
	const isSelected = derivedData[collection.key].isSelected && (!isTouchOrSmall || (isTouchOrSmall && !pickerMode));

	// cannot be picked if isPickerSkip
	const isPickerSkip = pickerMode && pickerSkipCollections && pickerSkipCollections.includes(collection.key);

	// cannot be opened if isDisabled
	const isDisabled = disabledCollections && disabledCollections.includes(collection.key);

	const handleSelect = useCallback(() => {
		if(pickerPicksCollection && !isPickerSkip && !isTouchOrSmall) {
			pickerPick({ collectionKey: collection.key, libraryKey: parentLibraryKey });
			// On touch devices, users can select a node even if it's in
			// `pickerSkip`. This allows navigation into unpickable collections
			// (such as a parent of a node being moved). On desktop, where
			// selection means picking, users should not be able to select a
			// `pickerSkip` collection in picker mode.
		} else if (!isDisabled && (isTouchOrSmall || (!isTouchOrSmall && !pickerMode) || (!isTouchOrSmall && pickerMode && !isPickerSkip) )) {
			selectNode({ collection: collection.key, view: 'collection' });
		}
	}, [pickerPicksCollection, isPickerSkip, isTouchOrSmall, isDisabled, pickerMode, pickerPick, collection.key, parentLibraryKey, selectNode]);

	const handleRenameTrigger = useCallback(() => {
		if (isTouchOrSmall || isReadOnly || pickerMode) {
			return;
		}
		setRenaming(collection.key);
	}, [collection, pickerMode, isReadOnly, isTouchOrSmall, setRenaming]);

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
		if ([PICKS_SINGLE_COLLECTION, PICKS_MULTIPLE_COLLECTIONS].includes(pickerMode) && !isPickerSkip && isTriggerEvent(ev)) {
			pickerPick({ collectionKey: collection.key, libraryKey: parentLibraryKey });
			ev.preventDefault();
		}
	}, [collection, pickerPick, pickerMode, isPickerSkip, parentLibraryKey]);

	const handleOpen = useCallback(ev => {
		if(isDisabled) {
			return;
		}
		return onOpen(ev);
	}, [isDisabled, onOpen])

	const usesItemsNode = (!pickerMode && isSingleColumn) || [PICKS_SINGLE_ITEM, PICKS_MULTIPLE_ITEMS].includes(pickerMode);

	const collections = allCollections.filter(c => c.parentCollection === collection.key );
	const hasSubCollections = collections.length > 0;
	const hasSubCollectionsOrItemsNode = hasSubCollections || usesItemsNode;
	const { selectedDepth } = derivedData[collection.key];

	const selectedHasChildren = isCurrentLibrary && selectedCollectionKey && (derivedData[selectedCollectionKey] || {}).hasChildren;

	// if isSelected is a nested child, hasOpen is true
	// if isSelected is a direct child, hasOpen is only true if
	// either selected is not a leaf node or we're in singleColumn mode (where there is always extra "Items" node)
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
				'selected': isSelected,
				'picked': pickerMode && isPicked,
				'picker-skip': isPickerSkip,
				'disabled': isDisabled,
				'highlighted': isHighlighted,
				'collection': true,
			})}
			aria-labelledby={ id.current }
			aria-selected={ isSelected }
			aria-level={ level }
			data-collection-key={ collection.key }
			aria-disabled={pickerMode && (isPickerSkip || isDisabled) }
			dndData={{ 'targetType': 'collection', collectionKey: collection.key, libraryKey: parentLibraryKey, getParents, isFileUploadAllowed } }
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
			shouldBeDraggable={!pickerMode && renaming !== collection.key }
			showTwisty={ hasSubCollections && !isDisabled }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
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
			{(pickerPicksCollection && !isReadOnly && !isPickerSkip && isTouchOrSmall) ? (
				<PickerCheckbox
					collectionKey={collection.key}
					parentLibraryKey={parentLibraryKey}
					pickerPick={pickerPick}
					picked={picked}
				/>
			) : (pickerPicksCollection && isTouchOrSmall) ? <div className="picker-checkbox-placeholder" /> : null}
			<Icon type={ hasSubCollections ? '28/folders' : '28/folder' } className="touch" width="28" height="28" />
			<Icon
				type={ '16/folder' }
				symbol={ 'folder' }
				className="mouse"
				width="16"
				height="16"
			/>
			{ renaming === collection.key ? (
				<Editable
					aria-label="Rename Collection"
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
					<Fragment>
						<div
							className="truncate"
							id={ id.current }
							title={ collectionName }
						>
							{ collectionName }
						</div>
						{pickerMode ? null : (
							<DotMenu
								collection = { collection }
								setRenaming = { setRenaming }
								parentLibraryKey = { parentLibraryKey }
								isReadOnly={isReadOnly}
								{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd',
								'dotMenuFor', 'focusBySelector', 'onFocusNext', 'opened',
								'setDotMenuFor', 'setOpened']) }
							/>
						)}
					</Fragment>
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
	pickerMode: PropTypes.number,
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
		const sfCollections = collections.filter(c => !c.deleted);

		sfCollections.sort((c1, c2) =>
			c1.name.toUpperCase().localeCompare(c2.name.toUpperCase())
		);
		return sfCollections;
	}, [collections]);

	return (
        <Fragment>
			<ItemsNode
				parentCollectionKey={ parentCollectionKey }
				{...pick(rest, ['pickerMode', 'itemsSource', 'onFocusNext', 'onFocusPrev',
				'level', 'parentCollectionKey', 'selectedCollectionKey', 'selectNode', 'shouldBeTabbable']) }
			/>
			{ sortedFilteredCollections.map(c =>
				<CollectionNode
					key={ c.key }
					collection={ c }
					parentCollectionKey={ parentCollectionKey }
					{ ...pick(rest, [ 'addVirtual', 'allCollections', 'cancelAdd', 'collection',
					'commitAdd', 'derivedData', 'dotMenuFor', 'disabledCollections',
						'focusBySelector', 'getParents', 'isCurrentLibrary', 'pickerMode',
					'isFileUploadAllowed', 'isReadOnly', 'level', 'onFocusNext', 'onFocusPrev', 'onOpen',
					'opened', 'parentLibraryKey', 'pickerSkipCollections', 'picked', 'pickerPick', 'renaming',
					'selectedCollectionKey', 'selectNode', 'setDotMenuFor', 'setOpened', 'setRenaming',
					'shouldBeTabbable', 'virtual',])}
				/>
			) }
			<VirtualCollectionNode
				parentCollectionKey= { parentCollectionKey }
				{ ...pick(rest, ['virtual', 'cancelAdd', 'commitAdd', 'focusBySelector',
					'level', 'parentLibraryKey', 'pickerMode'] )}
			/>
		</Fragment>
    );
});

CollectionsNodeList.propTypes = {
	collections: PropTypes.array,
	parentCollectionKey: PropTypes.string,
};

CollectionsNodeList.displayName = 'CollectionsNodeList';

const CollectionTree = props => {
	const { onNodeSelected = noop, parentLibraryKey, collectionKey: currentCollectionKey,
		itemsSource, pickerMode, pickerNavigate = noop, ...rest } = props;
	const dispatch = useDispatch();
	const levelWrapperRef = useRef(null);
	const dataObjects = useSelector(state => state.libraries[parentLibraryKey]?.dataObjects);
	const libraries = useSelector(state => state.config.libraries);
	const isTrash = useSelector(state => state.current.isTrash);
	const isMyPublications = useSelector(state => state.current.isMyPublications);
	const stateSelectedLibraryKey = useSelector(state => state.current.libraryKey);
	const isFetchingAllCollections = useSelector(
		state => parentLibraryKey in state.libraries ? state.libraries[parentLibraryKey].collections.isFetchingAll : false
	);

	const prevCollectionKey = usePrevious(currentCollectionKey);
	const currentCollection = dataObjects?.[currentCollectionKey];
	const prevCollection = usePrevious(currentCollection);

	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isFirstRendering = useSelector(state => state.current.isFirstRendering);

	const highlightedCollections = useSelector(state => state.current.highlightedCollections);
	const prevHighlightedCollections = usePrevious(highlightedCollections);

	const isCurrentLibrary = !pickerMode && parentLibraryKey === stateSelectedLibraryKey;
	const usesItemsNode = (!pickerMode && isSingleColumn) || [PICKS_SINGLE_ITEM, PICKS_MULTIPLE_ITEMS].includes(pickerMode);
	const allCollections = useMemo(() => Object.values(dataObjects ?? {}).filter(dataObject => dataObject[Symbol.for('type')] === 'collection'), [dataObjects]);

	const path = useMemo(
		() => makeCollectionsPath(currentCollectionKey, dataObjects ?? {}, isCurrentLibrary),
		[dataObjects, isCurrentLibrary, currentCollectionKey]
	);

	const [opened, setOpened] = useState(path.slice(0, -1));
	const [renaming, setRenaming] = useState(null);
	const [dotMenuFor, setDotMenuFor] = useState(null);

	const getParents = useCallback((collectionKey) => {
		const parents = [];
		let parentKey = dataObjects?.[collectionKey]?.parentCollection;
		while(parentKey) {
			parents.push(parentKey);
			parentKey = dataObjects?.[parentKey]?.parentCollection;
		}
		return parents;
	}, [dataObjects]);

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
		pickerMode ? pickerNavigate(path) : dispatch(navigate(path, true));
		onNodeSelected(path);
	}, [dispatch, pickerMode, onNodeSelected, parentLibraryKey, pickerNavigate]);

	const ensurePathToSelectedIsOpened = useCallback(() => {
		setOpened([...opened, ...path.slice(0, -1)]);
	}, [opened, path]);

	const derivedData = useMemo(
		() => {
			return makeDerivedData(dataObjects, path, opened, isTouchOrSmall);
		},
		[dataObjects, isTouchOrSmall, opened, path]
	);

	const selectedDepth = path.length;
	const selectedHasChildren = isCurrentLibrary && currentCollectionKey && (derivedData[currentCollectionKey] || {}).hasChildren;
	const hasOpen = (selectedDepth > 0 && (selectedHasChildren || usesItemsNode)) || selectedDepth > 1;

	const topLevelCollections = allCollections.filter(c => c.parentCollection === false );
	const isLastLevel = usesItemsNode ? false : Object.keys(dataObjects ?? []).length === 0;

	const shouldBeTabbableOnTouch = isCurrentLibrary && !currentCollectionKey;
	const shouldBeTabbable = shouldBeTabbableOnTouch || !isTouchOrSmall;

	const { isFileUploadAllowed, isReadOnly, isMyLibrary } = libraries.find(l => l.key === parentLibraryKey);

	useEffect(() => {
		if(!shallowEqual(highlightedCollections, prevHighlightedCollections)) {
			const parentsOfHighlighted = highlightedCollections.map(cKey => {
				let parentCKeys = [];
				do {
					cKey = cKey in dataObjects ? dataObjects[cKey].parentCollection : null;
					if (cKey) {
						parentCKeys.push(cKey);
					}
				} while (cKey);
				// if the highlighted collection or any of its parents is deleted, don't open any of them
				return parentCKeys.some(cKey => dataObjects[cKey]?.deleted) ? [] : parentCKeys;
			}).flat();

			if(parentsOfHighlighted.length > 0) {
				setOpened([...opened,  ...parentsOfHighlighted]);
			}
		}
	}, [dataObjects, highlightedCollections, opened, prevHighlightedCollections]);

	useEffect(() => {
		if(currentCollectionKey !== prevCollectionKey) {
			// ignore selected collection key
			return;
		}
		if(currentCollection?.parentCollection !== prevCollection?.parentCollection) {
			ensurePathToSelectedIsOpened();
		}
	}, [ensurePathToSelectedIsOpened, prevCollection, currentCollection, currentCollectionKey, prevCollectionKey]);

	useEffect(() => {
		if (isFirstRendering && !pickerMode && !isTouchOrSmall) {
			let targetEl = null;

			if(currentCollectionKey) {
				targetEl = levelWrapperRef.current?.querySelector(`[data-collection-key="${currentCollectionKey}"]`);
			} else if(isTrash) {
				targetEl = levelWrapperRef.current?.querySelector('[data-trash]');
			}

			if(targetEl) {
				targetEl.scrollIntoView();
			}
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
				pickerMode={ pickerMode }
				isReadOnly={ isReadOnly }
				itemsSource={ itemsSource }
				level={ 2 }
				onOpen={ handleOpenToggle }
				opened={ opened }
				parentLibraryKey = { parentLibraryKey }
				renaming={ renaming }
				selectedCollectionKey={ currentCollectionKey }
				selectNode={ selectNode }
				setDotMenuFor={ setDotMenuFor }
				setOpened={ setOpened }
				setRenaming={ setRenaming }
				shouldBeTabbable={ shouldBeTabbable }
				getParents ={ getParents }
				{ ...pick(rest, ['addVirtual', 'commitAdd', 'cancelAdd', 'disabledCollections',
				'onFocusNext', 'onFocusPrev', 'focusBySelector', 'picked', 'pickerPick',
				'pickerSkipCollections', 'virtual']) }
			/>
			<PublicationsNode
				level={ 2 }
				isMyLibrary = { isMyLibrary }
				pickerMode={pickerMode }
				isSelected = { isCurrentLibrary && isMyPublications }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
			/>
			<TrashNode
				level={ 2 }
				pickerMode={pickerMode }
				isReadOnly = { isReadOnly }
				isSelected = { isCurrentLibrary && isTrash }
				parentLibraryKey = { parentLibraryKey }
				selectNode = { selectNode }
				shouldBeTabbable = { shouldBeTabbable }
				{ ...pick(rest, ['onFocusNext', 'onFocusPrev']) }
			/>
		</LevelWrapper>
	);
};

CollectionTree.propTypes = {
	collectionKey: PropTypes.string,
	isMyPublications: PropTypes.bool,
	isTrash: PropTypes.bool,
	itemsSource: PropTypes.string,
	libraryKey: PropTypes.string,
	onNodeSelected: PropTypes.func,
	parentLibraryKey: PropTypes.string,
	pickerMode: PropTypes.number,
	pickerNavigate: PropTypes.func,
};

export default memo(CollectionTree);

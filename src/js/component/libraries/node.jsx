import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useState } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd'
import { useDebouncedCallback } from 'use-debounce';

import Icon from '../ui/icon';
import { ATTACHMENT, ITEM, COLLECTION } from '../../constants/dnd';
import { isTriggerEvent } from '../../common/event';
import { stopPropagation, noop } from '../../utils';
import { pick } from '../../common/immutable';

const Node = props => {
	const { className, children, dndData, isOpen, isReadOnly, isFileUploadAllowed, onFileDrop, onNodeDrop, onOpen = noop, onRename =
		noop, onRenameCancel = noop, onSelect = noop, showTwisty, onFocusNext = noop, onFocusPrev =
		noop, onKeyDown = noop, subtree, onDrillDownNext = noop, onDrillDownPrev = noop,
		shouldBeDraggable, ...rest } = props;
	const [isFocused, setIsFocused] = useState(false);

	const [_, drag] = useDrag({ // eslint-disable-line no-unused-vars
		type: COLLECTION,
		canDrag: () => shouldBeDraggable,
		item: () => {
			onRenameCancel();
			return dndData;
		},
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			if(dropResult) {
				const src = dndData;
				const dest = dropResult;
				onNodeDrop(src, dest);
			}
		}
	});

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: [ATTACHMENT, COLLECTION, ITEM, NativeTypes.FILE],
		collect: (monitor) => ({
			isOver:  monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		canDrop: (item, monitor) => {
			if(!monitor.isOver({ shallow: true })) {
				// extra check is required to confirm drop happens on a collection and not
				// encompassing library
				return false;
			}

			if(isReadOnly) {
				return;
			}

			const srcItemType = monitor.getItemType();
			const srcItem = monitor.getItem();

			if(srcItemType === ITEM) {
				const { libraryKey: sourceLibraryKey } = srcItem;
				if(dndData.targetType === 'library' && dndData.libraryKey !== sourceLibraryKey) {
					return true;
				}
				if(dndData.targetType === 'collection') {
					// TODO: check if item already belong to a collection
					return true;
				}
			} else if(srcItemType === COLLECTION) {
				const {
					collectionKey: srcCollectionKey,
					libraryKey: srcLibraryKey,
					getParents: srcGetParents,
				} = srcItem;
				const {
					targetType,
					collectionKey: targetCollectionKey,
					libraryKey: targetLibraryKey,
					getParents: targetGetParents,
				} = dndData;

				if(!['collection', 'library'].includes(targetType)) {
					return false;
				}

				const targetParents = targetGetParents ? targetGetParents(targetCollectionKey) : null;
				const srcParents = srcGetParents ? srcGetParents(srcCollectionKey) : null;

				if(srcLibraryKey === targetLibraryKey && targetParents?.includes(srcCollectionKey)) {
					// check for parent collection being dragged onto its child #453
					return false;
				}

				if(srcParents?.[0] === targetCollectionKey) {
					// check if target collection key is already immediate parent of src collection
					return false
				}

				return srcLibraryKey === targetLibraryKey && srcCollectionKey !== targetCollectionKey;
			} else if(srcItemType === ATTACHMENT) {
				const { libraryKey: srcLibraryKey } = srcItem;
				const { libraryKey: targetLibraryKey, targetType } = dndData;
				if(!['collection', 'library'].includes(targetType)) {
					return false;
				}
				return srcLibraryKey === targetLibraryKey;
			} else if(srcItemType === NativeTypes.FILE) {
				if (!isFileUploadAllowed) {
					return false;
				}
				if(!['collection', 'library'].includes(dndData.targetType)) {
					return false;
				}
				return true;
			}
			return false;
		},
		drop: (item, monitor) => {
			const srcItemType = monitor.getItemType();
			const srcItem = monitor.getItem();

			if(srcItemType === NativeTypes.FILE) {
				if(srcItem.files && srcItem.files.length) {
					onFileDrop(srcItem.files);
				}
				return;
			} else if(srcItemType === ATTACHMENT) {
				return { library: dndData.libraryKey, collection: dndData.collectionKey };
			} else if(srcItemType === ITEM || srcItemType === COLLECTION) {
				return dndData;
			}
		}
	});

	const handleTwistyMouseDown = useCallback(ev => {
		ev && ev.stopPropagation();
		onOpen(ev);
	}, [onOpen]);

	const handleMouseDown = useDebouncedCallback(useCallback(ev => {
		// node selects on mousedown, not click. Debounce to avoid multiple onmousedown events on touch #461
		onSelect(ev);
	}, [onSelect]), 100, { leading: true, trailing: false })

	const handleDoubleClick = useCallback(ev => {
		onRename(ev);
	}, [onRename]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === "ArrowLeft") {
			ev.target === ev.currentTarget ? onOpen(ev, false) : onDrillDownPrev(ev);
		} else if(ev.key === "ArrowRight") {
			isOpen || !showTwisty ? onDrillDownNext(ev) : onOpen(ev, true);
		} else if(ev.key === "ArrowDown") {
			ev.target === ev.currentTarget && onFocusNext(ev);
		} else if(ev.key === "ArrowUp") {
			ev.target === ev.currentTarget && onFocusPrev(ev);
		} else if(isTriggerEvent(ev)) {
			ev.target === ev.currentTarget && onSelect(ev);
		}
		onKeyDown(ev);
	}, [isOpen, onDrillDownNext, onDrillDownPrev, onFocusNext, onFocusPrev, onSelect, onKeyDown, onOpen, showTwisty]);

	const handleFocus = useCallback(ev => {
		if(ev.target === ev.currentTarget) {
			setIsFocused(true);
		}
	}, []);

	const handleBlur = useCallback(ev => {
		if(ev.target === ev.currentTarget) {
			setIsFocused(false);
		}
	}, []);

	return drag(drop(
		<li className={ cx(className, { focus: isFocused }) }>
			<div
				{ ...pick(rest, propName => propName.startsWith('data-') ||
					propName.startsWith('aria-') || propName === 'tabIndex') }
				className={ cx('item-container', { 'dnd-target': isOver && canDrop }) }
				role="treeitem button"
				aria-expanded={ (subtree || showTwisty) ? isOpen : null }
				onMouseDown={ handleMouseDown }
				onDoubleClick={ handleDoubleClick }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				onKeyDown={ handleKeyDown }
			>
				{ subtree || showTwisty ? (
					<button
						className="twisty"
						onDoubleClick={ stopPropagation }
						onClick={ stopPropagation }
						onMouseDown={ handleTwistyMouseDown }
						tabIndex={ -1 }
						type="button"
					>
						<Icon type={ '16/triangle' } width="16" height="16" />
					</button>
				) : null }
				{ children }
			</div>
			{ subtree }
		</li>
	));
}

Node.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	dndData: PropTypes.object,
	isOpen: PropTypes.bool,
	isOver: PropTypes.bool,
	onDrillDownNext: PropTypes.func,
	onDrillDownPrev: PropTypes.func,
	onFileDrop: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	onKeyDown: PropTypes.func,
	onNodeDrop: PropTypes.func,
	onOpen: PropTypes.func,
	onRename: PropTypes.func,
	onSelect: PropTypes.func,
	showTwisty: PropTypes.bool,
	subtree: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
}

export default memo(Node);

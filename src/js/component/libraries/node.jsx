import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd'

import Icon from '../ui/icon';
import { ATTACHMENT, ITEM, COLLECTION } from '../../constants/dnd';
import { isTriggerEvent } from '../../common/event';
import { noop } from '../../utils';
import { pick } from '../../common/immutable';

const Node = props => {
	const { className, children, dndData, isOpen, onClick = noop, onFileDrop, onNodeDrop, onOpen =
		noop, onRename, onRenameCancel, showTwisty, onFocusNext = noop, onFocusPrev = noop,
		onKeyDown = noop, subtree, onDrillDownNext = noop, onDrillDownPrev = noop, shouldBeDraggable,
		...rest } = props;
	const [isFocused, setIsFocused] = useState(false);
	const isLongPress = useRef(false);
	const isLongPressCompleted = useRef(false);
	const ongoingLongPress = useRef(null);
	const isDraggingRef = useRef(false);

	const [{ isDragging }, drag] = useDrag({
		type: COLLECTION,
		canDrag: () => shouldBeDraggable,
		item: () => {
			onRenameCancel();
			return dndData;
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging()
		}),
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
					libraryKey: srcLibraryKey
				} = srcItem;
				const {
					targetType,
					collectionKey: targetCollectionKey,
					libraryKey: targetLibraryKey
				} = dndData;

				if(!['collection', 'library'].includes(targetType)) {
					return false;
				}
				// TODO: check for parent collection being dragged to its child #453
				return srcLibraryKey === targetLibraryKey && srcCollectionKey !== targetCollectionKey;
			} else if(srcItemType === ATTACHMENT) {
				const { libraryKey: srcLibraryKey } = srcItem;
				const { libraryKey: targetLibraryKey, targetType } = dndData;
				if(!['collection', 'library'].includes(targetType)) {
					return false;
				}
				return srcLibraryKey === targetLibraryKey;
			} else if(srcItemType === NativeTypes.FILE) {
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

	const handleTwistyClick = useCallback(ev => {
		ev && ev.stopPropagation();
		onOpen(ev);
	}, [onOpen]);

	const handleMouseLeave = useCallback(() => {
		clearTimeout(ongoingLongPress.current);
	}, []);

	const handleMouseUp = useCallback(() => {
		if(isLongPress.current && !isLongPressCompleted.current) {
			clearTimeout(ongoingLongPress.current);
			isLongPressCompleted.current = false;
		}
	}, []);

	const handleMouseClick = useCallback(ev => {
		if(!isLongPress.current || !isLongPressCompleted.current) {
			onClick(ev);
		}
		isLongPress.current = false;
		isLongPressCompleted.current = false;
	}, [onClick]);

	const handleMouseDown = useCallback(ev => {
		if(!onRename) {
			isLongPress.current = false;
			return;
		}

		isLongPress.current = true;
		isLongPressCompleted.current = false;
		ev.persist();

		ongoingLongPress.current = setTimeout(() => {
			isLongPressCompleted.current = true;
			ev.preventDefault();

			if(!isDraggingRef.current) {
				onRename(ev);
			}
		}, 900);
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
			ev.target === ev.currentTarget && ev.target.click();
		}
		onKeyDown(ev);
	}, [isOpen, onDrillDownNext, onDrillDownPrev, onFocusNext, onFocusPrev, onKeyDown, onOpen, showTwisty]);

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

	useEffect(() => {
		isDraggingRef.current = isDragging;
		if(isDragging) {
			isLongPress.current = false
			isLongPressCompleted.current = true;
			clearTimeout(ongoingLongPress.current);
		}
	}, [isDragging]);

	return drag(drop(
		<li className={ cx(className, { focus: isFocused }) }>
			<div
				{ ...pick(rest, propName => propName.startsWith('data-') ||
					propName.startsWith('aria-') || propName === 'tabIndex') }
				className={ cx('item-container', { 'dnd-target': isOver && canDrop }) }
				role="treeitem button"
				aria-expanded={ (subtree || showTwisty) ? isOpen : null }
				onMouseDown={ handleMouseDown }
				onMouseUp={ handleMouseUp }
				onMouseLeave={ handleMouseLeave }
				onClick={ handleMouseClick }
				onFocus={ handleFocus }
				onBlur={ handleBlur }
				onKeyDown={ handleKeyDown }
			>
				{ subtree || showTwisty ? (
					<button
						className="twisty"
						onClick={ handleTwistyClick }
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
	canDrop: PropTypes.bool,
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	connectDragSource: PropTypes.func,
	connectDropTarget: PropTypes.func,
	dndTarget: PropTypes.object,
	isDragging: PropTypes.bool,
	isOpen: PropTypes.bool,
	isOver: PropTypes.bool,
	onClick: PropTypes.func,
	onDrillDownNext: PropTypes.func,
	onDrillDownPrev: PropTypes.func,
	onFileDrop: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	onKeyDown: PropTypes.func,
	onNodeDrop: PropTypes.func,
	onOpen: PropTypes.func,
	onRename: PropTypes.func,
	showTwisty: PropTypes.bool,
	subtree: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
}

export default memo(Node);

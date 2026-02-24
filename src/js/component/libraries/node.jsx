import cx from 'classnames';
import PropTypes from 'prop-types';
import {memo, useCallback, useRef, useState} from 'react';
import {NativeTypes} from 'react-dnd-html5-backend';
import {useDrag, useDrop} from 'react-dnd'
import {useDebouncedCallback} from 'use-debounce';
import {isTriggerEvent, noop, pick} from 'web-common/utils';
import {Icon} from 'web-common/components';
import {useFocusManager} from 'web-common/hooks'

import {ATTACHMENT, COLLECTION, ITEM} from '../../constants/dnd';
import {getScrollContainerPageCount, stopPropagation} from '../../utils';

const Node = props => {
	const { className, children, dndData, isOpen, isReadOnly, isFileUploadAllowed, onFileDrop, onNodeDrop, onOpen = noop, onRename =
		noop, onRenameCancel = noop, onSelect = noop, showTwisty, onFocusNext = noop, onFocusPrev =
		noop, onKeyDown = noop, subtree, shouldBeDraggable, ...rest } = props;
	const [isFocused, setIsFocused] = useState(false);
	const ref = useRef(null);
	const containerRef = useRef(null);
	const { receiveFocus, receiveBlur, focusNext, focusPrev } = useFocusManager(containerRef, { isFocusable: true, targetTabIndex: -3 });

	const [_, dragRef] = useDrag({ // eslint-disable-line no-unused-vars
		type: COLLECTION,
		canDrag: () => shouldBeDraggable,
		item: () => {
			onRenameCancel();
			return dndData;
		},
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();
			if(dropResult) {
				onNodeDrop(dndData, dropResult);
			}
		}
	});

	const [{ isOver, canDrop }, dropRef] = useDrop({
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
				if (srcItem.hasAttachment && !dndData.isFileUploadAllowed) {
					return false;
				}
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
				return ['collection', 'library'].includes(dndData.targetType);
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
				return {};
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
			ev.target === ev.currentTarget ? onOpen(ev, false) : focusPrev(ev);
		} else if(ev.key === "ArrowRight") {
			isOpen || !showTwisty ? focusNext(ev) : onOpen(ev, true);
		} else if(ev.key === "ArrowDown") {
			ev.target === ev.currentTarget && onFocusNext(ev);
		} else if(ev.key === "ArrowUp") {
			ev.target === ev.currentTarget && onFocusPrev(ev);
		} else if(ev.key === "PageDown") {
			if(ev.target === ev.currentTarget) {
				const containerEl = ev.currentTarget.closest('nav');
				onFocusNext(ev, { offset: getScrollContainerPageCount(ev.currentTarget, containerEl) });
			}
		} else if(ev.key === "PageUp") {
			if(ev.target === ev.currentTarget) {
				const containerEl = ev.currentTarget.closest('nav');
				onFocusPrev(ev, { offset: getScrollContainerPageCount(ev.currentTarget, containerEl) });
			}
		} else if(isTriggerEvent(ev)) {
			ev.target === ev.currentTarget && onSelect(ev);
		}
		onKeyDown(ev);
	}, [onKeyDown, onOpen, focusPrev, isOpen, showTwisty, focusNext, onFocusNext, onFocusPrev, onSelect]);

	const handleFocus = useCallback(ev => {
		if(ev.target === ev.currentTarget) {
			setIsFocused(true);
		}
		receiveFocus(ev);
	}, [receiveFocus]);

	const handleBlur = useCallback(ev => {
		if(ev.target === ev.currentTarget) {
			setIsFocused(false);
		}
		receiveBlur(ev);
	}, [receiveBlur]);

	dragRef(ref);
	dropRef(ref);

	return (
		// NOTE: Node can end up having both 'focus' and 'focused' classes.
		// Former is when node has a keyboard focus, latter is when collection
		// tree is focused. Admittedly, naming could be better.
		<li ref={ref} className={ cx(className, { focus: isFocused }) }>
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
				ref={ containerRef }
			>
				{ subtree || showTwisty ? (
					<button
						className="twisty"
						onDoubleClick={ stopPropagation }
						onClick={ stopPropagation }
						onMouseDown={ handleTwistyMouseDown }
						tabIndex={ -1 }
						type="button"
						title={ isOpen ? 'Collapse' : 'Expand' }
					>
						<Icon type={ '16/triangle' } width="16" height="16" />
					</button>
				) : null }
				{ children }
			</div>
			{ subtree }
		</li>
	);
}

Node.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	dndData: PropTypes.object,
	isFileUploadAllowed: PropTypes.bool,
	isOpen: PropTypes.bool,
	isOver: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	onFileDrop: PropTypes.func,
	onFocusNext: PropTypes.func,
	onFocusPrev: PropTypes.func,
	onKeyDown: PropTypes.func,
	onNodeDrop: PropTypes.func,
	onOpen: PropTypes.func,
	onRename: PropTypes.func,
	onRenameCancel: PropTypes.func,
	onSelect: PropTypes.func,
	shouldBeDraggable: PropTypes.bool,
	showTwisty: PropTypes.bool,
	subtree: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
}

export default memo(Node);

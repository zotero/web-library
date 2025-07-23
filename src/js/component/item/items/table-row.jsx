import cx from 'classnames';
import PropTypes from 'prop-types';
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd'
import memoize from 'memoize-one';

import { AttachmentCell, TitleCell, GenericDataCell, PlaceholderCell } from '../../common/table-cell';
import { selectItemsMouse } from '../../../common/selection';
import { ATTACHMENT, ITEM } from '../../../constants/dnd';
import {
	currentAddTags, currentAddToCollection, createAttachmentsFromDropped, currentCopyToLibrary,
	pickBestAttachmentItemAction, pickBestItemAction, navigateSelectItemsMouse
} from '../../../actions';
import { useItemsKeys } from '../../../hooks';
import { PICKS_MULTIPLE_ITEMS } from '../../../constants/picker-modes';

const DROP_MARGIN_EDGE = 5; // how many pixels from top/bottom of the row triggers "in-between" drop

const getSelectedIndexes = memoize((selectedItemKeys, keys) => {
	const selectedIndexes = selectedItemKeys.map(k => keys.indexOf(k));
	selectedIndexes.sort();
	return selectedIndexes;
});

const TableRow = props => {
	const id = useId();
	const labelledById = `${id}-title`;
	const dispatch = useDispatch();
	const ref = useRef();
	const ignoreClicks = useRef({});
	const [dropZone, setDropZone] = useState(null);
	const { data, index, style } = props;
	const { columns, onFileHoverOnRow, libraryKey, collectionKey, itemsSource, selectedItemKeys, pickerMode, pickerNavigate, q, qmode } = data;
	const keys = useItemsKeys({ libraryKey, collectionKey, itemsSource });
	const itemKey = keys && keys[index] ? keys[index] : null;
	const isFileUploadAllowedInLibrary = useSelector(
		state => (state.config.libraries.find(
			l => l.key === libraryKey
		) || {}).isFileUploadAllowed
	);
	const isFileUploadAllowed = isFileUploadAllowedInLibrary && !['trash', 'publications'].includes(itemsSource);

	const itemData = useSelector(
		state => itemKey
			? state.libraries[state.current.libraryKey]?.dataObjects?.[itemKey]?.[Symbol.for('derived')]
			: null
	);
	const bestAttachment = useSelector(state => itemKey
		? state.libraries[state.current.libraryKey]?.dataObjects?.[itemKey]?.[Symbol.for('links')]?.attachment
		: false
	);

	const selectedIndexes = getSelectedIndexes(selectedItemKeys, keys);
	const selectedItemKeysLength = selectedItemKeys.length;
	const isSelected = selectedItemKeys.includes(itemKey);
	const isFirstRowOfSelectionBlock = selectedIndexes.includes(index) && !selectedIndexes.includes(index - 1);
	const isLastRowOfSelectionBlock = selectedIndexes.includes(index) && !selectedIndexes.includes(index + 1);

	// useDrag options must not be recreated or it will reset drag preview (which we set for empty image)
	// causing two "ghosts" to appear - the native one (which we don't want) and the one web library renders
	const useDragOptions = useMemo(() => ({ dropEffect: 'copy' }), []);

	const [_, drag, preview] = useDrag({ // eslint-disable-line no-unused-vars
		type: ITEM,
		options: useDragOptions,
		item: () => {
			return { itemKey, selectedItemKeysLength, itemData, libraryKey, hasAttachment: !!bestAttachment || itemData.itemTypeRaw === 'attachment' };
		},
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();

			if (dropResult && dropResult.targetType) {
				if (dropResult.targetType === 'tag') {
					dispatch(currentAddTags([dropResult.tag]));
				} else if (dropResult.targetType === 'library' || dropResult.targetType === 'collection') {
					const { targetType, collectionKey: targetCollectionKey, libraryKey: targetLibraryKey } = dropResult;
					if (targetLibraryKey && targetLibraryKey !== libraryKey) {
						dispatch(currentCopyToLibrary(targetLibraryKey, targetType === 'collection' ? targetCollectionKey : null));
					} else if (targetCollectionKey) {
						dispatch(currentAddToCollection(targetCollectionKey));
					}
				}
			}
		}
	});

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: [ATTACHMENT, NativeTypes.FILE],
		canDrop: () => isFileUploadAllowed,
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		drop: (item, monitor) => {
			const itemType = monitor.getItemType();
			if (itemType === NativeTypes.FILE) {
				const parentItem = dropZone === null ? itemKey : null;
				const collection = parentItem === null ? collectionKey : null;
				const shouldIgnoreDrop = parentItem !== null && ['attachment', 'note'].includes(itemData.itemTypeRaw);
				if (!shouldIgnoreDrop && item.files && item.files.length) {
					dispatch(createAttachmentsFromDropped(item.files, { collection, parentItem }));
				}
			}
			if (itemType === ATTACHMENT) {
				return dropZone === null ? { item: itemKey } : { collection: collectionKey };
			}
		},
		hover: (item, monitor) => {
			if (ref.current && monitor.getClientOffset()) {
				const cursor = monitor.getClientOffset();
				const rect = ref.current.getBoundingClientRect();
				const offsetTop = cursor.y - rect.y;
				const offsetBottom = (rect.y + rect.height) - cursor.y;
				const margin = ['attachment', 'note'].includes(itemData.itemTypeRaw) ? Math.floor(rect.height / 2) : DROP_MARGIN_EDGE;

				if (offsetTop < margin) {
					setDropZone('top');
				} else if (offsetBottom < margin) {
					setDropZone('bottom');
				} else {
					setDropZone(null);
				}
			}
		}
	});

	const className = cx('item', {
		odd: (index + 1) % 2 === 1,
		'nth-4n-1': (index + 2) % 4 === 0,
		'nth-4n': (index + 1) % 4 === 0,
		'active': isSelected,
		'first-active': isFirstRowOfSelectionBlock,
		'last-active': isLastRowOfSelectionBlock,
		'dnd-target': canDrop && itemData && !(['attachment', 'note'].includes(itemData.itemTypeRaw)) && isOver && dropZone === null,
		'dnd-target-top': canDrop && isOver && dropZone === 'top',
		'dnd-target-bottom': canDrop && isOver && dropZone === 'bottom',
	});

	const selectItem = useCallback((itemKey, ev) => {
		const isCtrlModifier = ev.getModifierState('Control') || ev.getModifierState('Meta');
		const isShiftModifier = ev.getModifierState('Shift');
		if (pickerMode) {
			const allowMultiple = pickerMode === PICKS_MULTIPLE_ITEMS;
			const nextKeys = selectItemsMouse(itemKey, allowMultiple && isShiftModifier, allowMultiple && isCtrlModifier, { keys, selectedItemKeys });
			pickerNavigate({ library: libraryKey, collection: collectionKey, items: nextKeys, search: q, qmode, view: 'item-list' })
		} else {
			dispatch(navigateSelectItemsMouse(itemKey, isShiftModifier, isCtrlModifier));
		}
	}, [pickerMode, keys, selectedItemKeys, pickerNavigate, libraryKey, collectionKey, q, qmode, dispatch]);

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	const handleMouseEvent = useCallback(event => {
		if (itemData) {
			if (selectedItemKeysLength > 1 && isSelected && event.type === 'mousedown') {
				// ignore a "mousedown" when user might want to drag items
				return;
			} else {
				if (selectedItemKeysLength > 1 && isSelected && event.type === 'click') {
					const isFollowUp = itemKey in ignoreClicks.current &&
						Date.now() - ignoreClicks.current[itemKey] < 500;

					if (isFollowUp) {
						// ignore a follow-up click, it has been handled as "mousedown"
						return;
					} else {
						// handle a "click" event that has been missed by "mousedown" handler
						// in anticipation of potential drag that has never happened
						selectItem(itemKey, event, dispatch);
						delete ignoreClicks.current[itemKey];
						return
					}
				}
			}
			if (event.type === 'mousedown') {
				// finally handle mousedowns as select events
				ignoreClicks.current[itemKey] = Date.now();
				selectItem(itemKey, event, dispatch);
			}
			if (event.type === 'dblclick' && itemData.itemTypeRaw !== 'note' && itemData.attachmentIconName !== null) {
				if (itemData.itemTypeRaw === 'attachment') {
					dispatch(pickBestAttachmentItemAction(itemData.key));
				} else {
					dispatch(pickBestItemAction(itemKey));
				}
			}
		}
	}, [dispatch, isSelected, itemData, itemKey, selectItem, selectedItemKeysLength]);

	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true })
	}, [preview]);

	useEffect(() => {
		isFileUploadAllowed && onFileHoverOnRow(isOver, dropZone);
	}, [isOver, dropZone, isFileUploadAllowed, onFileHoverOnRow]);

	return drag(drop(
		<div
			aria-selected={isSelected}
			aria-rowindex={index + 1}
			aria-labelledby={labelledById}
			className={className}
			style={style}
			data-index={index}
			data-key={itemKey}
			onClick={handleMouseEvent}
			onDoubleClick={handleMouseEvent}
			onMouseDown={handleMouseEvent}
			role="row"
			ref={ref}
			tabIndex={-2}
		>
			{columns.map((c, colIndex) => itemData ? (
				c.field === 'title' ? (
					<TitleCell
						labelledById={labelledById}
						key={c.field}
						colIndex={colIndex}
						isFirstColumn={colIndex === 0}
						isLastColumn={colIndex === columns.length - 1}
						columnName={c.field}
						itemData={itemData}
						width={`var(--col-${colIndex}-width)`}
					/>
				) : c.field === 'attachment' ? (
					<AttachmentCell
						key={c.field}
						colIndex={colIndex}
						isFirstColumn={colIndex === 0}
						isLastColumn={colIndex === columns.length - 1}
						columnName={c.field}
						itemData={itemData}
						width={`var(--col-${colIndex}-width)`}
					/>
				) : (
					<GenericDataCell
						key={c.field}
						colIndex={colIndex}
						isFirstColumn={colIndex === 0}
						isLastColumn={colIndex === columns.length - 1}
						columnName={c.field}
						itemData={itemData}
						width={`var(--col-${colIndex}-width)`}
					/>
				)
			) : <PlaceholderCell
				key={c.field}
				width={`var(--col-${colIndex}-width)`}
				colIndex={colIndex}
				isFirstColumn={colIndex === 0}
				isLastColumn={colIndex === columns.length - 1}
				columnName={c.field}
			/>)}
		</div>
	));
};

TableRow.propTypes = {
	data: PropTypes.shape({
		onFileHoverOnRow: PropTypes.func,
		columns: PropTypes.array,
	}),
	index: PropTypes.number,
	style: PropTypes.object,
};

export default memo(TableRow);

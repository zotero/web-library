import cx from 'classnames';
import React, { memo, useEffect, useRef, useState } from 'react';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd-cjs'

import Cell from './table-cell';
import Icon from '../../ui/icon';
import { ATTACHMENT, ITEM } from '../../../constants/dnd';
import { createAttachmentsFromDropped, chunkedCopyToLibrary, chunkedAddToCollection, navigate } from '../../../actions';

const DROP_MARGIN_EDGE = 5; // how many pixels from top/bottom of the row triggers "in-between" drop

const selectItem = (itemKey, ev, keys, selectedItemKeys, dispatch) => {
	const isCtrlModifier = ev.getModifierState('Control') || ev.getModifierState('Meta');
	const isShiftModifier = ev.getModifierState('Shift');
	var newKeys;

	if(isShiftModifier) {
		let startIndex = selectedItemKeys.length ? keys.findIndex(key => key && key === selectedItemKeys[0]) : 0;
		let endIndex = keys.findIndex(key => key && key === itemKey);
		let isFlipped = false;
		if(startIndex > endIndex) {
			[startIndex, endIndex] = [endIndex, startIndex];
			isFlipped = true;
		}

		endIndex++;
		newKeys = keys.slice(startIndex, endIndex);
		if(isFlipped) {
			newKeys.reverse();
		}
	} else if(isCtrlModifier) {
		if(selectedItemKeys.includes(itemKey)) {
			newKeys = selectedItemKeys.filter(key => key !== itemKey);
		} else {
			newKeys = [...(new Set([...selectedItemKeys, itemKey]))];
		}
	} else {
		newKeys = [itemKey];
	}
	dispatch(navigate({ items: newKeys }));
}

const DataCell = props => {
	const { columnName, colIndex, width, isFocused, isActive, itemData } = props;
	const dvp = window.devicePixelRatio >= 2 ? 2 : 1;

	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			{ columnName === 'title' && (
				<Icon
					type={ `16/item-types/light/${dvp}x/${itemData.iconName}` }
					symbol={ isFocused && isActive ? `${itemData.iconName}-white` : itemData.iconName }
					width="16"
					height="16"
				/>
			)}
			<div className="truncate">
				{ itemData[columnName] }
			</div>
			{ columnName === 'title' && (
				<div className="tag-colors">
					{ itemData.colors.map((color, index) => (
						<Icon
							key={ color }
							type={ index === 0 ? '10/circle' : '10/crescent-circle' }
							symbol={ index === 0 ?
								(isFocused && isActive ? 'circle-focus' : 'circle') :
								(isFocused && isActive ? 'crescent-circle-focus' : 'crescent-circle')
							}
							width={ index === 0 ? 10 : 7 }
							height="10"
							style={ { color } }
						/>
					)) }
				</div>
			) }
		</Cell>
	);
}

const PlaceholderCell = props => {
	const { columnName, colIndex, width } = props;
	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			{ columnName === 'title' && <div className="placeholder-icon" /> }
			<div className="placeholder" />
		</Cell>
	);
}

const TableRow = memo(props => {
	const dispatch = useDispatch();
	const ref = useRef();
	const ignoreClicks = useRef({});
	const [dropZone, setDropZone] = useState(null);
	const { data, index, style } = props;
	const { onFileHoverOnRow, isFocused, keys, width, columns } = data;
	const itemKey = keys && keys[index] ? keys[index] : null;
	const libraryKey = useSelector(state => state.current.libraryKey);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const itemData = useSelector(
		state => itemKey ?
			state.libraries[state.current.libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);
	const selectedItemKeys = useSelector(state => state.current.itemKey ?
		[state.current.itemKey] : state.current.itemKeys,
		shallowEqual
	);
	const isActive = itemKey && selectedItemKeys.includes(itemKey);

	const [_, drag, preview] = useDrag({ // eslint-disable-line no-unused-vars
		item: { type: ITEM },
		begin: () => {
			const isDraggingSelected = selectedItemKeys.includes(itemKey);
			return { itemKey, selectedItemKeys, itemData, isDraggingSelected, libraryKey }
		},
		end: (item, monitor) => {
			const isDraggingSelected = selectedItemKeys.includes(itemKey);
			const sourceItemKeys = isDraggingSelected ? selectedItemKeys : [itemKey];
			const dropResult = monitor.getDropResult();

			if(dropResult) {
				const { targetType, collectionKey: targetCollectionKey, libraryKey: targetLibraryKey } = dropResult;
				if(targetType === 'library') {
					dispatch(chunkedCopyToLibrary(sourceItemKeys, targetLibraryKey));
				}
				if(targetType === 'collection') {
					dispatch(chunkedAddToCollection(sourceItemKeys, targetCollectionKey, targetLibraryKey));
				}
			}
		}
	});

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: [ATTACHMENT, NativeTypes.FILE],
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		drop: (item, monitor) => {
			const itemType = monitor.getItemType();
			if(itemType === NativeTypes.FILE) {
				const parentItem = dropZone === null ? itemKey : null;
				const collection = parentItem === null ? collectionKey : null;
				const isAttachmentOnAttachment = parentItem !== null && itemData.itemTypeRaw === 'attachment';
				if(!isAttachmentOnAttachment && item.files && item.files.length) {
					dispatch(createAttachmentsFromDropped(item.files, { collection, parentItem }));
				}
			}
			if(itemType === ATTACHMENT) {
				return dropZone === null ? { item: itemKey } : { collection: collectionKey };
			}
		},
		hover: (item, monitor) => {
			if(ref.current && monitor.getClientOffset()) {
				const cursor = monitor.getClientOffset();
				const rect = ref.current.getBoundingClientRect();
				const offsetTop = cursor.y - rect.y;
				const offsetBottom = (rect.y + rect.height) - cursor.y;
				const margin = itemData.itemTypeRaw === 'attachment' ? Math.floor(rect.height / 2) : DROP_MARGIN_EDGE;

				if(offsetTop < margin) {
					setDropZone('top');
				} else if(offsetBottom < margin) {
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
		active: isActive,
		'dnd-target': canDrop && itemData && itemData.itemTypeRaw !== 'attachment' && isOver && dropZone === null,
		'dnd-target-top': canDrop && isOver && dropZone === 'top',
		'dnd-target-bottom': canDrop && isOver && dropZone === 'bottom',
	});

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	const handleMouseEvent = event => {
		if(itemData) {
			const isSelected = selectedItemKeys.includes(itemKey);
			if(selectedItemKeys.length > 1 &&
				isSelected && event.type === 'mousedown') {
				// ignore a "mousedown" when user might want to drag items
				return;
			} else {
				if(selectedItemKeys.length > 1 && isSelected &&
					event.type === 'click') {
					const isFollowUp = itemKey in ignoreClicks.current &&
						Date.now() - ignoreClicks.current[itemKey] < 500;

					if(isFollowUp) {
						// ignore a follow-up click, it has been handled as "mousedown"
						return;
					} else {
						// handle a "click" event that has been missed by "mousedown" handler
						// in anticipation of potential drag that has never happened
						selectItem(itemKey, event, keys, selectedItemKeys, dispatch);
						delete ignoreClicks.current[itemKey];
						return
					}
				}
				//@TODO: handle double click to open attachment
				// if(event.type === 'dblclick' && item.attachmentItemKey) {
				// 	openAttachment(item.attachmentItemKey, getAttachmentUrl, true);
				// }
			}
			if(event.type === 'mousedown') {
				// finally handle mousedowns as select events
				ignoreClicks.current[itemKey] = Date.now();
				selectItem(itemKey, event, keys, selectedItemKeys, dispatch);
			}
		}
	}

	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true })
	}, []);

	useEffect(() => {
		onFileHoverOnRow(isOver, dropZone);
	}, [isOver, dropZone]);

	return drag(drop(
		<div
			ref={ ref }
			className={ className }
			style={ style }
			data-index={ index }
			onClick={ handleMouseEvent }
			onDoubleClick={ handleMouseEvent }
			onMouseDown={ handleMouseEvent }
		>
			{ columns.map((c, colIndex) => itemData ? (
				<DataCell
					key={ c.field }
					colIndex={ colIndex }
					columnName={ c.field }
					isActive={ isActive }
					isFocused={ isFocused }
					itemData={ itemData }
					width={ `var(--col-${colIndex}-width)` }
				/>
			) : <PlaceholderCell
				key={ c.field }
				width={ `var(--col-${colIndex}-width)` }
				colIndex={ colIndex }
				columnName={ c.field }
			/> ) }
		</div>
	));
});

export default TableRow;

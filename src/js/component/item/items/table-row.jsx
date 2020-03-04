import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd'

import Cell from './table-cell';
import Icon from '../../ui/icon';
import { ATTACHMENT, ITEM } from '../../../constants/dnd';
import colorNames from '../../../constants/color-names';
import { createAttachmentsFromDropped, chunkedCopyToLibrary, chunkedAddToCollection,
	getAttachmentUrl, navigate } from '../../../actions';
import { openAttachment } from '../../../utils';

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
	dispatch(navigate({ items: newKeys, noteKey: null, attachmentKey: null }));
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
					label={ `${itemData.itemType} icon` }
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
							label={ `${colorNames[color] || ''} circle icon` }
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
			{ columnName === 'attachment' && (
				<Icon
					type={ `16/item-types/light/${dvp}x/${itemData.attachmentIconName}` }
					symbol={ isFocused && isActive ? `${itemData.attachmentIconName}-white` : itemData.attachmentIconName }
					width="16"
					height="16"
				/>
			) }
		</Cell>
	);
};

DataCell.propTypes = {
	colIndex: PropTypes.number,
	columnName: PropTypes.string,
	isActive: PropTypes.bool,
	isFocused: PropTypes.bool,
	itemData: PropTypes.object,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};


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

PlaceholderCell.propTypes = {
	colIndex: PropTypes.number,
	columnName: PropTypes.string,
	width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const TableRow = memo(props => {
	const dispatch = useDispatch();
	const ref = useRef();
	const ignoreClicks = useRef({});
	const [dropZone, setDropZone] = useState(null);
	const { data, index, style } = props;
	const { onFileHoverOnRow, keys, columns } = data;
	const itemKey = keys && keys[index] ? keys[index] : null;
	const libraryKey = useSelector(state => state.current.libraryKey);
	const isFileUploadAllowed = useSelector(
		state => (state.config.libraries.find(
			l => l.key === state.current.libraryKey
		) || {}).isFileUploadAllowed
	);
	const collectionKey = useSelector(state => state.current.collectionKey);
	const isFocused = useSelector(state => state.current.isItemsTableFocused);
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
	const dispatchGetAttachmentUrl = useCallback((...args) => dispatch(getAttachmentUrl(...args)));

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
				if(targetLibraryKey && targetLibraryKey !== libraryKey) {
					dispatch(chunkedCopyToLibrary(sourceItemKeys, targetLibraryKey, targetType === 'collection' ? targetCollectionKey : null));
				} else {
					dispatch(chunkedAddToCollection(sourceItemKeys, targetCollectionKey));
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
			if(itemType === NativeTypes.FILE) {
				const parentItem = dropZone === null ? itemKey : null;
				const collection = parentItem === null ? collectionKey : null;
				const shouldIgnoreDrop = parentItem !== null && ['attachment', 'note'].includes(itemData.itemTypeRaw);
				if(!shouldIgnoreDrop && item.files && item.files.length) {
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
				const margin = ['attachment', 'note'].includes(itemData.itemTypeRaw) ? Math.floor(rect.height / 2) : DROP_MARGIN_EDGE;

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
		focused: isFocused,
		'dnd-target': canDrop && itemData && !(['attachment', 'note'].includes(itemData.itemTypeRaw)) && isOver && dropZone === null,
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
			}
			if(event.type === 'mousedown') {
				// finally handle mousedowns as select events
				ignoreClicks.current[itemKey] = Date.now();
				selectItem(itemKey, event, keys, selectedItemKeys, dispatch);
			}
			if(event.type === 'dblclick' && itemData.attachmentItemKey) {
				openAttachment(itemData.attachmentItemKey, dispatchGetAttachmentUrl, true);
			}
		}
	}

	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true })
	}, []);

	useEffect(() => {
		isFileUploadAllowed && onFileHoverOnRow(isOver, dropZone);
	}, [isOver, dropZone, isFileUploadAllowed]);

	return drag(drop(
		<div
			aria-selected={ isActive }
			aria-rowindex={ index + 1 }
			ref={ ref }
			className={ className }
			style={ style }
			data-index={ index }
			data-key={ itemKey }
			onClick={ handleMouseEvent }
			onDoubleClick={ handleMouseEvent }
			onMouseDown={ handleMouseEvent }
			role="row"
			tabIndex={ -2 }
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

TableRow.propTypes = {
	data: PropTypes.shape({
		onFileHoverOnRow: PropTypes.func,
		isFocused: PropTypes.bool,
		keys: PropTypes.array,
		columns: PropTypes.array,
	}),
	index: PropTypes.number,
	style: PropTypes.object,
};

export default TableRow;

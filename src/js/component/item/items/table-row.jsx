import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd'

import Cell from './table-cell';
import Icon from '../../ui/icon';
import { ATTACHMENT, ITEM } from '../../../constants/dnd';
import colorNames from '../../../constants/color-names';
import { currentAddTags, currentAddToCollection, createAttachmentsFromDropped, currentCopyToLibrary,
openAttachment, openBestAttachment, openBestAttachmentFallback, selectItemsMouse } from
'../../../actions';
import { useSourceKeys } from '../../../hooks';

const DROP_MARGIN_EDGE = 5; // how many pixels from top/bottom of the row triggers "in-between" drop

const selectItem = (itemKey, ev, dispatch) => {
	const isCtrlModifier = ev.getModifierState('Control') || ev.getModifierState('Meta');
	const isShiftModifier = ev.getModifierState('Shift');
	dispatch(selectItemsMouse(itemKey, isShiftModifier, isCtrlModifier));
}

const TitleCell = memo(props => {
	const { columnName, colIndex, width, isFocused, isSelected, itemData } = props;
	const dvp = window.devicePixelRatio >= 2 ? 2 : 1;

	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			<Icon
				label={ `${itemData.itemType} icon` }
				type={ `16/item-types/light/${dvp}x/${itemData.iconName}` }
				symbol={ isFocused && isSelected ? `${itemData.iconName}-white` : itemData.iconName }
				width="16"
				height="16"
			/>
			<div className="truncate">
				{ itemData[columnName] }
			</div>
			<div className="tag-colors">
				{ itemData.colors.map((color, index) => (
					<Icon
						label={ `${colorNames[color] || ''} circle icon` }
						key={ index }
						type={ index === 0 ? '10/circle' : '10/crescent-circle' }
						symbol={ index === 0 ?
							(isFocused && isSelected ? 'circle-focus' : 'circle') :
							(isFocused && isSelected ? 'crescent-circle-focus' : 'crescent-circle')
						}
						width={ index === 0 ? 10 : 7 }
						height="10"
						style={ { color } }
					/>
				)) }
			</div>
		</Cell>
	);
});

TitleCell.displayName = 'TitleCell';

const AttachmentCell = memo(props => {
	const { columnName, colIndex, width, isFocused, isSelected, itemData } = props;
	const dvp = window.devicePixelRatio >= 2 ? 2 : 1;

	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			<div className="truncate">
				{ itemData[columnName] }
			</div>
			{ itemData.attachmentIconName && (
				<Icon
					type={ `16/item-types/light/${dvp}x/${itemData.attachmentIconName}` }
					symbol={ isFocused && isSelected ? `${itemData.attachmentIconName}-white` : itemData.attachmentIconName }
					width="16"
					height="16"
				/>
			) }
		</Cell>
	);
})

AttachmentCell.displayName = 'AttachmentCell';

const GenericDataCell = memo(props => {
	const { columnName, colIndex, width, itemData } = props;

	return (
		<Cell
			width={ width }
			columnName={ columnName }
			index={ colIndex }
		>
			<div className="truncate">
				{ itemData[columnName] }
			</div>
		</Cell>
	);
});

GenericDataCell.displayName = 'GenericDataCell';

GenericDataCell.propTypes = {
	colIndex: PropTypes.number,
	columnName: PropTypes.string,
	isSelected: PropTypes.bool,
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

const TableRow = props => {
	const dispatch = useDispatch();
	const ref = useRef();
	const ignoreClicks = useRef({});
	const [dropZone, setDropZone] = useState(null);
	const { data, index, style } = props;
	const { onFileHoverOnRow, columns } = data;
	const keys = useSourceKeys();
	const itemKey = keys && keys[index] ? keys[index] : null;
	const libraryKey = useSelector(state => state.current.libraryKey);
	const isFileUploadAllowed = useSelector(
		state => (state.config.libraries.find(
			l => l.key === state.current.libraryKey
		) || {}).isFileUploadAllowed
	);
	const collectionKey = useSelector(state => state.current.collectionKey);

	const itemData = useSelector(
		state => itemKey ?
			state.libraries[state.current.libraryKey].items[itemKey][Symbol.for('derived')]
			: null
	);
	const selectedItemKeysLength = useSelector(state => state.current.itemKeys.length);
	const isSelected = useSelector(state => itemKey && state.current.itemKeys.includes(itemKey));

	//@NOTE: to avoid re-rendering unselected rows on focus change, we only check isFocused if isSelected
	const isFocusedAndSelected = useSelector(state => isSelected && state.current.isItemsTableFocused);

	const [_, drag, preview] = useDrag({ // eslint-disable-line no-unused-vars
		type: ITEM,
		options: {
			dropEffect: 'copy'
		},
		item: () => {
			return { itemKey, selectedItemKeysLength, itemData, libraryKey }
		},
		end: (item, monitor) => {
			const dropResult = monitor.getDropResult();

			if(dropResult && dropResult.targetType) {
				if(dropResult.targetType === 'tag') {
					dispatch(currentAddTags([dropResult.tag]));
				} else if(dropResult.targetType === 'library' || dropResult.targetType === 'collection') {
					const { targetType, collectionKey: targetCollectionKey, libraryKey: targetLibraryKey } = dropResult;
					if(targetLibraryKey && targetLibraryKey !== libraryKey) {
						dispatch(currentCopyToLibrary(targetLibraryKey, targetType === 'collection' ? targetCollectionKey : null));
					} else if(targetCollectionKey) {
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
		active: isSelected,
		focused: isFocusedAndSelected,
		'dnd-target': canDrop && itemData && !(['attachment', 'note'].includes(itemData.itemTypeRaw)) && isOver && dropZone === null,
		'dnd-target-top': canDrop && isOver && dropZone === 'top',
		'dnd-target-bottom': canDrop && isOver && dropZone === 'bottom',
	});

	//@NOTE: In order to allow item selection on "mousedown" (#161)
	//		 this event fires twice, once on "mousedown", once on "click".
	//		 Click events are discarded unless "mousedown" could
	//		 have been triggered as a drag event in which case "mousedown"
	//		 is ignored and "click" is used instead, if occurs.
	const handleMouseEvent = useCallback(event => {
		if(itemData) {
			if(selectedItemKeysLength > 1 && isSelected && event.type === 'mousedown') {
				// ignore a "mousedown" when user might want to drag items
				return;
			} else {
				if(selectedItemKeysLength > 1 && isSelected && event.type === 'click') {
					const isFollowUp = itemKey in ignoreClicks.current &&
						Date.now() - ignoreClicks.current[itemKey] < 500;

					if(isFollowUp) {
						// ignore a follow-up click, it has been handled as "mousedown"
						return;
					} else {
						// handle a "click" event that has been missed by "mousedown" handler
						// in anticipation of potential drag that has never happened
						selectItem(itemKey, event,  dispatch);
						delete ignoreClicks.current[itemKey];
						return
					}
				}
			}
			if(event.type === 'mousedown') {
				// finally handle mousedowns as select events
				ignoreClicks.current[itemKey] = Date.now();
				selectItem(itemKey, event, dispatch);
			}
			if(event.type === 'dblclick' && itemData.itemTypeRaw !== 'note') {
				dispatch(openBestAttachment(itemKey));
				if(itemData.itemTypeRaw === 'attachment') {
					dispatch(openAttachment(itemData.key));
				} else {
					dispatch(openBestAttachment(itemKey));
				}
			}
		}
	}, [dispatch, isSelected, itemData, itemKey, selectedItemKeysLength]);

	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true })
	}, [preview]);

	useEffect(() => {
		isFileUploadAllowed && onFileHoverOnRow(isOver, dropZone);
	}, [isOver, dropZone, isFileUploadAllowed, onFileHoverOnRow]);

	const attach = useCallback((domElement) => {
		drag(domElement);
		drop(domElement);
		ref.current = domElement;
	}, [drag, drop]);

	return (
		<div
			aria-selected={ isSelected }
			aria-rowindex={ index + 1 }
			className={ className }
			style={ style }
			data-index={ index }
			data-key={ itemKey }
			onClick={ handleMouseEvent }
			onDoubleClick={ handleMouseEvent }
			onMouseDown={ handleMouseEvent }
			role="row"
			ref={ attach }
			tabIndex={ -2 }
		>
			{ columns.map((c, colIndex) => itemData ? (
				c.field === 'title' ? (
					<TitleCell
						key={ c.field }
						colIndex={ colIndex }
						columnName={ c.field }
						isSelected={ isSelected }
						isFocused={ isFocusedAndSelected }
						itemData={ itemData }
						width={ `var(--col-${colIndex}-width)` }
					/>
				) : c.field === 'attachment' ? (
					<AttachmentCell
						key={ c.field }
						colIndex={ colIndex }
						columnName={ c.field }
						isSelected={ isSelected }
						isFocused={ isFocusedAndSelected }
						itemData={ itemData }
						width={ `var(--col-${colIndex}-width)` }
					/>
				) : (
					<GenericDataCell
						key={ c.field }
						colIndex={ colIndex }
						columnName={ c.field }
						itemData={ itemData }
						width={ `var(--col-${colIndex}-width)` }
					/>
				)
			) : <PlaceholderCell
				key={ c.field }
				width={ `var(--col-${colIndex}-width)` }
				colIndex={ colIndex }
				columnName={ c.field }
			/> ) }
		</div>
	);
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

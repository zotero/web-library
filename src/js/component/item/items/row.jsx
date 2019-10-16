import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend-cjs';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd-cjs'

import { createAttachmentsFromDropped } from '../../../actions';
import { getFilesData } from '../../../common/event';
import { ITEM } from '../../../constants/dnd';
import { noop } from '../../../utils';


const DROP_MARGIN_EDGE = 5; // how many pixels from top/bottom of the row triggers "in-between" drop

const Row = props => {
	const { className, columns, index, libraryKey, rowData, onDrag, selectedItemKeys, style } = props;
	const itemKey = rowData.key;
	const rowRef = useRef();
	const [dropZone, setDropZone] = useState(null);
	const dispatch = useDispatch();
	const collectionKey = useSelector(state => state.current.collectionKey);

	const [_, drag, preview] = useDrag({ // eslint-disable-line no-unused-vars
		item: { type: ITEM },
		begin: () => {
			const isDraggingSelected = selectedItemKeys.includes(itemKey);
			return { itemKey, selectedItemKeys, rowData, isDraggingSelected, libraryKey }
		},
		end: (item, monitor) => {
			const isDraggingSelected = selectedItemKeys.includes(itemKey);
			const dropResult = monitor.getDropResult();

			if(dropResult) {
				onDrag({
					itemKeys: isDraggingSelected ? selectedItemKeys : [itemKey],
					...dropResult
				});
			}
		}
	});

	const [{ isOver, canDrop }, drop] = useDrop({
		accept: NativeTypes.FILE,
		collect: monitor => ({
			isOver: monitor.isOver({ shallow: true }),
			canDrop: monitor.canDrop(),
		}),
		drop: async item => {
			const parentItem = dropZone === null ? itemKey : null;
			const collection = parentItem === null ? collectionKey : null;
			const isAttachmentOnAttachment = parentItem !== null && rowData.itemTypeRaw === 'attachment';
			if(!isAttachmentOnAttachment && item.files && item.files.length) {
				dispatch(createAttachmentsFromDropped(item.files, { collection, parentItem }));
			}
		},
		hover: (item, monitor) => {
			if(rowRef.current && monitor.getClientOffset()) {
				const cursor = monitor.getClientOffset();
				const rect = rowRef.current.getBoundingClientRect();
				const offsetTop = cursor.y - rect.y;
				const offsetBottom = (rect.y + rect.height) - cursor.y;
				const margin = rowData.itemTypeRaw === 'attachment' ? Math.floor(rect.height / 2) : DROP_MARGIN_EDGE;

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

	const onMouseDown = props.onRowClick ? useCallback(event => props.onRowClick({event, index, rowData})) : noop;
	const onClick = props.onRowClick ? useCallback(event => props.onRowClick({event, index, rowData})) : noop;
	const onDoubleClick = props.onRowDoubleClick ? useCallback(event => props.onRowDoubleClick({event, index, rowData})) : noop;
	const onMouseOut = props.onRowMouseOut ? useCallback(event => props.onRowMouseOut({event, index, rowData})) : noop;
	const onMouseOver = props.onRowMouseOver ? useCallback(event => props.onRowMouseOver({event, index, rowData})) : noop;
	const onContextMenu = props.onRowRightClick ? useCallback(event => props.onRowRightClick({event, index, rowData})) : noop;

	useEffect(() => {
		preview(getEmptyImage(), { captureDraggingState: true })
	}, []);

	return (
		<React.Fragment>
			{ drag(drop(
				<div
					onMouseDown={ onMouseDown }
					onClick={ onClick }
					onDoubleClick={ onDoubleClick }
					onMouseOut={ onMouseOut }
					onMouseOver={ onMouseOver }
					onContextMenu={ onContextMenu }
					className={ cx(className, {
						'dnd-target': canDrop && rowData.itemTypeRaw !== 'attachment' && isOver && dropZone === null,
						'dnd-target-top': canDrop && isOver && dropZone === 'top',
						'dnd-target-bottom': canDrop && isOver && dropZone === 'bottom',
					}) }
					data-index={ index }
					ref={ rowRef }
					role="row"
					style={ style }
				>
					{ columns }
				</div>
			)) }
		</React.Fragment>
	);
}

Row.propTypes = {
	className: PropTypes.string,
	columns: PropTypes.array,
	index: PropTypes.number,
	libraryKey: PropTypes.string,
	onDrag: PropTypes.func,
	onRowClick: PropTypes.func,
	onRowDoubleClick: PropTypes.func,
	onRowMouseOut: PropTypes.func,
	onRowMouseOver: PropTypes.func,
	onRowRightClick: PropTypes.func,
	rowData: PropTypes.object,
	selectedItemKeys: PropTypes.array,
	style: PropTypes.object,
};

export default Row;

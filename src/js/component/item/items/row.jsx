'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd-cjs';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend-cjs';
import { ITEM } from '../../../constants/dnd';

const dndSpec = {
	beginDrag: ({ selectedItemKeys, rowData, libraryKey }) => {
		const itemKey = rowData.key;
		const isDraggingSelected = selectedItemKeys.includes(itemKey);
		return { itemKey, selectedItemKeys, rowData, isDraggingSelected, libraryKey };
	},
	endDrag: ({ rowData, selectedItemKeys, onDrag }, monitor) => {
		const itemKey = rowData.key;
		const isDraggingSelected = selectedItemKeys.includes(itemKey);
		const dropResult = monitor.getDropResult();
		if(dropResult) {
			onDrag({
				itemKeys: isDraggingSelected ? selectedItemKeys : [itemKey],
				...dropResult
			});
		}
	}
};

const dndCollect = (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	connectDragPreview: connect.dragPreview(),
	isDragging: monitor.isDragging(),
});

const fileTarget = {
	drop(props, monitor) {
		//@TODO: handle file drop
	}
};

const fileCollect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
});

class Row extends React.PureComponent {
	componentDidMount() {
		const { connectDragPreview } = this.props;
		connectDragPreview(getEmptyImage());
	}

	render() {
		const a11yProps = {};
		const {
			className,
			columns,
			connectDropTarget,
			connectDragSource,
			connectDragPreview,
			index,
			isDragging,
			key,
			onRowClick,
			onRowDoubleClick,
			onRowMouseOut,
			onRowMouseOver,
			onRowRightClick,
			rowData,
			style,
			isOver,
			canDrop,
		} = this.props;
		if (
			onRowClick ||
			onRowDoubleClick ||
			onRowMouseOut ||
			onRowMouseOver ||
			onRowRightClick
		) {
			a11yProps['aria-label'] = 'row';

			if(onRowClick) {
				// Select item rows on mousedown
				// https://github.com/zotero/web-library/issues/161
				a11yProps.onMouseDown = event => onRowClick({event, index, rowData});
				a11yProps.onClick = event => onRowClick({event, index, rowData});
			}
			if(onRowDoubleClick) {
				a11yProps.onDoubleClick = event =>
				onRowDoubleClick({event, index, rowData});
			}
			if(onRowMouseOut) {
				a11yProps.onMouseOut = event => onRowMouseOut({event, index, rowData});
			}
			if(onRowMouseOver) {
				a11yProps.onMouseOver = event => onRowMouseOver({event, index, rowData});
			}
			if(onRowRightClick) {
				a11yProps.onContextMenu = event =>
				onRowRightClick({event, index, rowData});
			}
		}

		return connectDropTarget(connectDragSource(
			<div
				{...a11yProps}
				data-index={ index }
				className={ cx(className, { 'dnd-target': canDrop && isOver }) }
				key={ key }
				role="row"
				style={ style }
			>
				{ columns }
			</div>
		));
	}
}

export default DragSource(ITEM, dndSpec, dndCollect)(DropTarget(NativeTypes.FILE, fileTarget, fileCollect)(Row));

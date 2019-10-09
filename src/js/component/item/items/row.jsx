'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
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

		return connectDragSource(
			<div
				{...a11yProps}
				data-index={ index }
				className={className}
				key={ key }
				role="row"
				style={ style }
			>
				{ columns }
			</div>
		);
	}
}


export default DragSource(ITEM, dndSpec, dndCollect)(Row);

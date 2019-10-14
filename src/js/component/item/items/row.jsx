'use strict';

import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd-cjs';
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend-cjs';
import { ITEM } from '../../../constants/dnd';

const DROP_MARGIN_EDGE = 5; // how many pixels from top/bottom of the row triggers "in-between" drop

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
	},
	hover(props, monitor, component) {
		if(component.ref.current && monitor.getClientOffset()) {
			const cursor = monitor.getClientOffset();
			const rect = component.ref.current.getBoundingClientRect();
			const offsetTop = cursor.y - rect.y;
			const offsetBottom = (rect.y + rect.height) - cursor.y;

			if(offsetTop < DROP_MARGIN_EDGE) {
				component.setState({ 'dropZone': 'top' });
			} else if(offsetBottom < DROP_MARGIN_EDGE) {
				component.setState({ 'dropZone': 'bottom' });
			} else {
				component.setState({ 'dropZone': null });
			}
		}
	}
};

const fileCollect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
});

class Row extends React.PureComponent {
	state = { dropZone: null };
	ref = React.createRef();

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
		const { dropZone } = this.state;

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
				className={ cx(className, {
					'dnd-target': canDrop && isOver && dropZone === null,
					'dnd-target-top': canDrop && isOver && dropZone === 'top',
					'dnd-target-bottom': canDrop && isOver && dropZone === 'bottom',
				}) }
				data-index={ index }
				key={ key }
				ref={ this.ref }
				role="row"
				style={ style }
			>
				{ columns }
			</div>
		));
	}
}

export default DragSource(ITEM, dndSpec, dndCollect)(DropTarget(NativeTypes.FILE, fileTarget, fileCollect)(Row));

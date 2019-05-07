'use strict';

import React from 'react';
import Icon from './ui/icon';
import paramCase from 'param-case';
import { Consumer } from 'react-dnd/lib/cjs/DragDropContext'; //@NOTE: using undocumented featue
import { DragLayer } from 'react-dnd';
import { ITEM, CREATOR } from '../constants/dnd';

const dndCollect = monitor => ({
	clientOffset: monitor.getClientOffset(),
	currentOffset: monitor.getSourceClientOffset(),
	initialClientOffset: monitor.getInitialClientOffset(),
	initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
	differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
	isDragging: monitor.isDragging(),
	item: monitor.getItem(),
	itemType: monitor.getItemType(),
});

const getNextToCursorStyles = ({ clientOffset }) => {
		if (!clientOffset) {
			return {
				display: 'none'
			};
		}

		const x = Math.round(clientOffset.x);
		const y = Math.round(clientOffset.y);

		const transform = `translate(${x}px, ${y}px)`;
		return {
			transform: transform,
			WebkitTransform: transform
		};
}

const getRelativeToOriginalStyles = ({ differenceFromInitialOffset }, sourceRect) => {
		if (!differenceFromInitialOffset) {
			return {
				display: 'none'
			};
		}

		const x = Math.round(sourceRect.x + differenceFromInitialOffset.x);
		const y = Math.round(sourceRect.y + differenceFromInitialOffset.y);

		const transform = `translate(${x}px, ${y}px)`;
		return {
			width: sourceRect.width,
			height: sourceRect.height,
			transform: transform,
			WebkitTransform: transform
		};
}

@DragLayer(dndCollect)
class CustomDragLayer extends React.PureComponent {

	renderItem(type, props, isPreviewRequired) {
		switch (type) {
			case CREATOR:
				var { raw } = props;
				if(!isPreviewRequired) {
					// on desktops we use html5 backend
					return null
				}
				return (
					<div className="metadata creators creator-drag-preview">
						<div className="creator-type truncate">{ raw.creatorType }</div>
						<div className="name truncate">
							{ 'name' in raw ? raw.name : raw.lastName + ', ' + raw.firstName }
						</div>
					</div>
				)
			case ITEM:
				// for items dragging we always use custom preview
				var { isDraggingSelected, selectedItemKeys, rowData } = props;
				var iconName = paramCase(rowData.itemType);
				var dvp = window.devicePixelRatio >= 2 ? 2 : 1;

				if(isDraggingSelected && selectedItemKeys.length > 1) {
					return (
						<div className="items-drag-indicator multiple">
							<Icon
								type={`16/item-types/light/${dvp}x/document`}
								symbol="document-active"
								width="16"
								height="16"
							/>
							<span>{ selectedItemKeys.length } Items</span>
						</div>
					);
				} else {
					return (
						<div className="items-drag-indicator single">
							<Icon
								type={ `16/item-types/light/${dvp}x/${iconName}` }
								symbol={ `${iconName}-active` }
								width="16"
								height="16"
							/>
							<span>{ rowData.title }</span>
						</div>
					);
				}
			}
		}

	render() {
		const { item, itemType, isDragging } = this.props;
		var style;

		if (!isDragging) {
			return null;
		}

		switch(itemType) {
			case CREATOR:
				style = getRelativeToOriginalStyles(this.props, item.sourceRect);
			break
			case ITEM:
				style = getNextToCursorStyles(this.props);
			break;
		}

		return (
			<Consumer>
			{({ dragDropManager }) => {
				return (
					<div className="drag-layer">
						<div style={ style }>
							{ this.renderItem(
								itemType,
								item,
								dragDropManager.backend.previewEnabled()
							) }
						</div>
					</div>
				);
			}}
			</Consumer>
		);
	}
}

export default CustomDragLayer;

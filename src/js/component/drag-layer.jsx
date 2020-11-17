import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { useSelector } from 'react-redux';

import Icon from './ui/icon';
import { ITEM, CREATOR } from '../constants/dnd';
import { useDragLayer } from 'react-dnd';

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

const CreatorDragPreview = memo(({ creator }) => {
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	return isTouchOrSmall ? (
		<div className="metadata creators creator-drag-preview">
			<div className="creator-type truncate">{ creator.creatorType }</div>
			<div className="name truncate">
				{ 'name' in creator ? creator.name : creator.lastName + ', ' + creator.firstName }
			</div>
		</div>
	) : null; // on desktops we use html5 backend
});

CreatorDragPreview.displayName = 'CreatorDragPreview';

CreatorDragPreview.propTypes = {
	creator: PropTypes.object,
};

const SingleItemDragPreview = memo(({ itemData }) => {
	var dvp = window.devicePixelRatio >= 2 ? 2 : 1;

	return (
		<div className="items-drag-indicator single">
			<Icon
				type={ `16/item-types/light/${dvp}x/${itemData.iconName}` }
				symbol={ `${itemData.iconName}-white` }
				width="16"
				height="16"
			/>
			<span>{ itemData.title }</span>
		</div>
	);
});

SingleItemDragPreview.displayName = 'SingleItemDragPreview';

SingleItemDragPreview.whyDidYouRender = true;

SingleItemDragPreview.propTypes = {
	itemData: PropTypes.object,
};

const MultiItemsDragPreview = memo(({ selectedItemKeysLength }) => {
	var dvp = window.devicePixelRatio >= 2 ? 2 : 1;

	return (
		<div className="items-drag-indicator multiple">
			<Icon
				type={`16/item-types/light/${dvp}x/document`}
				symbol="document-white"
				width="16"
				height="16"
			/>
			<span>{ selectedItemKeysLength } Items</span>
		</div>
	);
});

MultiItemsDragPreview.displayName = 'MultiItemsDragPreview';

MultiItemsDragPreview.propTypes = {
	selectedItemKeysLength: PropTypes.number
};

const CustomDragLayer = () => {
	const { isDragging, itemType, item: draggedObject, ...offsets } = useDragLayer(dndCollect);
	var style;

	switch(itemType) {
		case CREATOR:
			style = getRelativeToOriginalStyles(offsets, draggedObject.sourceRect);
		break
		case ITEM:
			style = getNextToCursorStyles(offsets);
		break;
	}

	// @NOTE: re-renders constantly during drag operation due to offsets changing
	return isDragging ? (
		<div className="drag-layer">
			<div style={ style }>
				{ itemType === CREATOR && <CreatorDragPreview creator={ draggedObject.raw } />  }
				{ itemType === ITEM && draggedObject.selectedItemKeysLength === 1 &&
					<SingleItemDragPreview itemData={ draggedObject.itemData } />
				}
				{ itemType === ITEM && draggedObject.selectedItemKeysLength > 1 &&
					<MultiItemsDragPreview selectedItemKeysLength={ draggedObject.selectedItemKeysLength } />
				}
			</div>
		</div>
	) : null;
}

export default memo(CustomDragLayer);

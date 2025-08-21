import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import { ITEM, CREATOR, CITATION } from '../constants/dnd';
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

const getRelativeToOriginalStyles = ({ differenceFromInitialOffset }, sourceRect, { ignoreOffsetX = false, ignoreOffsetY = false } = {}) => {
	if (!differenceFromInitialOffset) {
		return {
			display: 'none'
		};
	}

	const x = ignoreOffsetX ? sourceRect.x : Math.round(sourceRect.x + differenceFromInitialOffset.x);
	const y = ignoreOffsetY ? sourceRect.y : Math.round(sourceRect.y + differenceFromInitialOffset.y);

	const transform = `translate(${x}px, ${y}px)`;
	return {
		width: sourceRect.width,
		height: sourceRect.height,
		transform: transform,
		WebkitTransform: transform
	};
}

const CreatorDragPreview = memo(({ creator }) => {
	return (
		<div className="metadata creators creator-drag-preview">
			<div className="creator-type truncate">{creator.creatorType}</div>
			<div className="name truncate">
				{'name' in creator ? creator.name : creator.lastName + ', ' + creator.firstName}
			</div>
		</div>
	);
});

CreatorDragPreview.displayName = 'CreatorDragPreview';

CreatorDragPreview.propTypes = {
	creator: PropTypes.object,
};

const CitationDragPreview = memo(({ bubbleString }) => {
	return(
		<div className="citation-touch drag-preview">
			<div className="form-row">
				<div className="col-12">
					<div className="form-group form-row">
						<Button className="btn label">
							{bubbleString}
						</Button>
						<div className="drag-handle" >
							<Icon type="24/grip" role="presentation" width="24" height="24" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

CitationDragPreview.displayName = 'CitationDragPreview';

CitationDragPreview.propTypes = {
	bubbleString: PropTypes.string,
};

const SingleItemDragPreview = memo(({ itemData }) => {
	return (
		<div className="items-drag-indicator single">
			<Icon
				type={`16/item-type/${itemData.iconName}`}
				symbol={`${itemData.iconName}-white`}
				usePixelRatio={true}
				width="16"
				height="16"
			/>
			<span>{itemData.title}</span>
		</div>
	);
});

SingleItemDragPreview.displayName = 'SingleItemDragPreview';

SingleItemDragPreview.propTypes = {
	itemData: PropTypes.object,
};

const MultiItemsDragPreview = memo(({ selectedItemKeysLength }) => {
	return (
		<div className="items-drag-indicator multiple">
			<Icon
				type={`16/item-type/document`}
				symbol="document-white"
				usePixelRatio={true}
				width="16"
				height="16"
			/>
			<span>{selectedItemKeysLength} Items</span>
		</div>
	);
});

MultiItemsDragPreview.displayName = 'MultiItemsDragPreview';

MultiItemsDragPreview.propTypes = {
	selectedItemKeysLength: PropTypes.number
};

const CustomDragLayer = () => {
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { isDragging, itemType, item: draggedObject, ...offsets } = useDragLayer(dndCollect);
	const needsDragLayer = isDragging && (itemType === ITEM || isTouchOrSmall); // on desktops we use html5 backend for anything but ITEM

	let style;
	if(isTouchOrSmall && (itemType === CITATION || itemType === CREATOR)) {
		style = getRelativeToOriginalStyles(offsets, draggedObject.sourceRect, { ignoreOffsetX: true });
	} else if(itemType === ITEM) {
		style = getNextToCursorStyles(offsets);
	}

	// @NOTE: re-renders constantly during drag operation due to offsets changing
	return needsDragLayer ? (
		<div className="drag-layer">
			<div style={style}>
				{isTouchOrSmall && itemType === CITATION && <CitationDragPreview bubbleString={draggedObject.bubbleString} />}
				{isTouchOrSmall && itemType === CREATOR && <CreatorDragPreview creator={draggedObject.raw} />}
				{itemType === ITEM && draggedObject.selectedItemKeysLength === 1 &&
					<SingleItemDragPreview itemData={draggedObject.itemData} />
				}
				{itemType === ITEM && draggedObject.selectedItemKeysLength > 1 &&
					<MultiItemsDragPreview selectedItemKeysLength={draggedObject.selectedItemKeysLength} />
				}
			</div>
		</div>
	) : null;
}

export default memo(CustomDragLayer);

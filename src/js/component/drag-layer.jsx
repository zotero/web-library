'use strict';

const React = require('react');
const Icon = require('./ui/icon');
const paramCase = require('param-case');
const { DragLayer } = require('react-dnd');
const { ITEM } = require('../constants/dnd');

const dndCollect = monitor => ({
	item: monitor.getItem(),
	itemType: monitor.getItemType(),
	currentOffset: monitor.getSourceClientOffset(),
	clientOffset: monitor.getClientOffset(),
	isDragging: monitor.isDragging()
});

const getItemStyles = props => {
	const { currentOffset, clientOffset } = props;
		if (!currentOffset) {
			return {
				display: 'none'
			};
		}

		const { x, y } = clientOffset;
		const transform = `translate(${x + 16}px, ${y}px)`;
		return {
			transform: transform,
			WebkitTransform: transform
		};
}

@DragLayer(dndCollect)
class CustomDragLayer extends React.PureComponent {

	renderItem(type, { isDraggingSelected, selectedItemKeys, rowData }) {
		switch (type) {
			case ITEM:
				if(isDraggingSelected && selectedItemKeys.length > 1) {
					return (
						<div className="items-drag-indicator multiple">
							<Icon type="16/document" width="16" height="16" />
							<span>{ selectedItemKeys.length } Items</span>
						</div>
					);
				} else {
					return (
						<div className="items-drag-indicator single">
							<Icon
								type={`16/item-types/${paramCase(rowData.itemType)}`}
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

		if (!isDragging) {
			return null;
		}

		return (
			<div className="drag-layer">
				<div style={ getItemStyles(this.props) }>
					{ this.renderItem(itemType, item) }
				</div>
			</div>
		);
	}
}

module.exports = CustomDragLayer;

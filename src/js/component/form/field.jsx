'use strict';

const React = require('react');
const { findDOMNode } = require('react-dom');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('../ui/icon');
const { DragSource, DropTarget } = require('react-dnd');
const { CREATOR } = require('../../constants/dnd');
const { noop } = require('../../utils');

//@NOTE: using findDOMNode and mutating monitor item here. Consider refactoring
//		 Based on: https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples/04%20Sortable/Simple/Card.tsx
const dndTargetSpec = {
	hover: ({ index, onReorder}, monitor, component) => {
		if(!component) { return null; }
		const dragIndex = monitor.getItem().index;
		const hoverIndex = index;
		if(dragIndex === hoverIndex) { return; }

		// eslint-disable-next-line react/no-find-dom-node
		const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
		const clientOffset = monitor.getClientOffset();
		const hoverClientY = clientOffset.y - hoverBoundingRect.top;
		if(dragIndex < hoverIndex && hoverClientY < hoverMiddleY) { return; }
		if(dragIndex > hoverIndex && hoverClientY > hoverMiddleY) { return; }

		onReorder(dragIndex, hoverIndex);
		monitor.getItem().index = hoverIndex;
	}
};

const dndSourceSpec = {
	beginDrag: ({ index, raw, onReorder, onReorderCommit, onReorderCancel}, monitor, component) => {
		if(!component) { return null; }
		// eslint-disable-next-line react/no-find-dom-node
		const sourceRect = findDOMNode(component).getBoundingClientRect();
		return { index, raw, onReorder, onReorderCommit, onReorderCancel, sourceRect};
	},
	endDrag: (props, monitor) => {
		const { onReorderCommit, onReorderCancel } = props;
		monitor.didDrop() ? onReorderCommit() : onReorderCancel();
	}
};

const dndTargetCollect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
});

const dndSourceCollect = (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	connectDragPreview: connect.dragPreview(),
	isDragging: monitor.isDragging(),
});

@DropTarget(CREATOR, dndTargetSpec, dndTargetCollect)
@DragSource(CREATOR, dndSourceSpec, dndSourceCollect)
class Field extends React.PureComponent {
	render() {
		const {
			canDrop,
			connectDragPreview,
			connectDragSource,
			connectDropTarget,
			isDragging,
			isOver,
			isSortable,
		} = this.props;
		const [label, value] = React.Children.toArray(this.props.children);
		const opacity = isDragging ? 0 : 1;
		const isDragTarget = isOver && canDrop;

		return isSortable ? connectDropTarget(
			connectDragPreview(
				<li
					style={ { opacity } }
					className={ cx('metadata', this.props.className, { 'dnd-target': isDragTarget }) }
				>
					<div className="key">
						{ label }
					</div>
					<div className="value">
						{ value }
					</div>
					{
						connectDragSource(
							<div className="handle">
								<Icon type={ '24/grip' } className="touch" width="24" height="24"/>
								<Icon type={ '12/grip' } className="mouse" width="12" height="12"/>
							</div>
						)
					}
				</li>
			)
		) : (
			<li
				className={ cx('metadata', this.props.className) }
			>
				<div className="key">
					{ label }
				</div>
				<div className="value">
					{ value }
				</div>
			</li>
		);
	}

	static propTypes = {
		children: PropTypes.array.isRequired,
		className: PropTypes.string,
		connectDragPreview: PropTypes.func,
		connectDragSource: PropTypes.func,
		connectDropTarget: PropTypes.func,
		isActive: PropTypes.bool,
		isDragging: PropTypes.bool,
		isSortable: PropTypes.bool,
		onReorder: PropTypes.func,
		onReorderCommit: PropTypes.func,
		onReorderCancel: PropTypes.func,
		raw: PropTypes.object,
	};

	static defaultProps = {
		onReorder: noop,
		onReorderCancel: noop,
		onReorderCommit: noop,
	}
}

module.exports = Field;

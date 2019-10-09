'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from '../ui/icon';
import { DragSource, DropTarget } from 'react-dnd';
import { CREATOR } from '../../constants/dnd';
import { noop } from '../../utils';
import { pick } from '../../common/immutable';

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

class Field extends React.PureComponent {
	componentDidUpdate({ isDragging: wasDragging }) {
		const { isDragging, onDragStatusChange } = this.props;
		if(isDragging !== wasDragging) {
			onDragStatusChange(isDragging);
		}
	}
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
		const isDragTarget = isOver && canDrop;

		return isSortable ? connectDropTarget(
			connectDragPreview(
				<li
					tabIndex={ this.props.tabIndex }
					onClick={ this.props.onClick }
					className={ cx('metadata', this.props.className, {
						'dnd-target': isDragTarget,
						'dnd-source': isDragging
					}) }
					{ ...pick(this.props, p => p.startsWith('data-')) }
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
				tabIndex={ this.props.tabIndex }
				onClick={ this.props.onClick }
				onKeyDown={ this.props.onKeyDown }
				className={ cx('metadata', this.props.className) }
				{ ...pick(this.props, p => p.startsWith('data-')) }
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
		isDragging: PropTypes.bool,
		isSortable: PropTypes.bool,
		onClick: PropTypes.func,
		onDragStatusChange: PropTypes.func,
		onKeyDown: PropTypes.func,
		onReorder: PropTypes.func,
		onReorderCancel: PropTypes.func,
		onReorderCommit: PropTypes.func,
		raw: PropTypes.object,
		tabIndex: PropTypes.number,
	};

	static defaultProps = {
		onClick: noop,
		onDragStatusChange: noop,
		onKeyDown: noop,
		onReorder: noop,
		onReorderCancel: noop,
		onReorderCommit: noop,
	}
}

export default DropTarget(CREATOR, dndTargetSpec, dndTargetCollect)(DragSource(CREATOR, dndSourceSpec, dndSourceCollect)(Field));

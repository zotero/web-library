'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Icon from '../ui/icon';
import { DragSource, DropTarget } from 'react-dnd';
import { noop } from '../../utils';
import { ITEM, COLLECTION } from '../../constants/dnd';
import { omit } from '../../common/immutable';
import { isTriggerEvent } from '../../common/event';

const dndSpec = {
	drop(props, monitor) {
		if(monitor.isOver({ shallow: true })) {
			const { dndTarget } = props;
			return dndTarget;
		}
	},
	canDrop({ dndTarget = {} }, monitor) {
		if(monitor.getItemType() === ITEM) {
			const { libraryKey: sourceLibraryKey } = monitor.getItem();
			if(dndTarget.targetType === 'library' && dndTarget.libraryKey !== sourceLibraryKey) {
				return true;
			}
			if(dndTarget.targetType === 'collection') {
				return true;
			}
		} else if(monitor.getItemType() === COLLECTION) {
			const {
				collectionKey: srcCollectionKey,
				libraryKey: srcLibraryKey
			} = monitor.getItem();
			const {
				targetType,
				collectionKey: targetCollectionKey,
				libraryKey: targetLibraryKey
			} = dndTarget;

			if(!['collection', 'library'].includes(targetType)) {
				return false;
			}
			return srcLibraryKey === targetLibraryKey && srcCollectionKey !== targetCollectionKey;
		}
	}
}

const dndCollect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
});

const dndCollectionDragSpec = {
	beginDrag: (props) => {
		return props.dndTarget;
	},
	canDrag: ({ shouldBeDraggable }) => shouldBeDraggable,
	endDrag: ({ dndTarget, onDrag }, monitor) => {
		const src = dndTarget;
		const target = monitor.getDropResult();
		if(target) {
			onDrag(src, target);
		}
	}
};

const dndCollectionDragCollect = (connect, monitor) => ({
	connectDragSource: connect.dragSource(),
	isDragging: monitor.isDragging(),
});

@DragSource(COLLECTION, dndCollectionDragSpec, dndCollectionDragCollect)
@DropTarget([COLLECTION, ITEM], dndSpec, dndCollect)
class Node extends React.PureComponent {
	state = {};

	handleTwistyClick = ev => {
		ev && ev.stopPropagation();
		this.props.onOpen();
	}

	handleMouseLeave = () => {
		clearTimeout(this.ongoingLongPress);
	}

	handleMouseUp = () => {
		if(this.isLongPress && !this.isLongPressCompleted) {
			clearTimeout(this.ongoingLongPress);
			this.isLongPressCompleted = false;
		}
	}

	handleMouseClick = ev => {
		if(!this.isLongPress || !this.isLongPressCompleted) {
			this.props.onClick(ev);
		}
		this.isLongPress = false;
		this.isLongPressCompleted = false;
	}

	handleMouseDown = ev => {
		if(!('onRename' in this.props)) {
			this.isLongPress = false;
			return;
		}

		this.isLongPress = true;
		this.isLongPressCompleted = false;
		ev.persist();
		this.ongoingLongPress = setTimeout(() => {
			const { isDragging } = this.props;
			this.isLongPressCompleted = true;
			ev.preventDefault();
			if(!isDragging) {
				this.props.onRename(ev);
			}
		}, 500);
	}

	handleKeyDown = ev => {
		const { onOpen } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === "ArrowLeft") {
			onOpen(false);
		} else if(ev.key === "ArrowRight") {
			onOpen(true);
		} else if(isTriggerEvent(ev)) {
			ev.target.click();
		}
	}

	handleFocus = ev => {
		if(ev.target === ev.currentTarget) {
			this.setState({ isFocused: true });
		}
	}

	handleBlur = ev => {
		if(ev.target === ev.currentTarget) {
			this.setState({ isFocused: false });
		}
	}

	render() {
		const { canDrop, children, className, connectDragSource,
			connectDropTarget, hideTwisty, isOpen, isOver, subtree, } = this.props;
		const { isFocused } = this.state;

		const twistyButton = (
			<button
				type="button"
				className="twisty"
				onClick={ this.handleTwistyClick }
			>
				<Icon type={ '16/triangle' } width="16" height="16" />
			</button>
		);
		const isActive = canDrop && isOver;
		const props = omit(this.props, ["canDrag", "canDrop", "children",
			"className", "connectDragSource", "connectDropTarget", "dndTarget",
			"hideTwisty", "isDragging", "isOpen", "isOver", "onOpen", "subtree",
			"onClick", "onRename", "shouldBeDraggable"
		]);

		return connectDragSource(connectDropTarget(
			<li
				className={ cx(className, { focus: isFocused }) }
				>
				<div
					className={ cx('item-container', { 'dnd-target': isActive }) }
					role="treeitem"
					aria-expanded={ isOpen }
					onMouseDown={ this.handleMouseDown }
					onMouseUp={ this.handleMouseUp }
					onMouseLeave={ this.handleMouseLeave }
					onClick={ this.handleMouseClick }
					onFocus={ this.handleFocus }
					onBlur={ this.handleBlur }
					onKeyDown={ this.handleKeyDown }
					{ ...props }
				>
					{ subtree && !hideTwisty ? twistyButton : null }
					{ children }
				</div>
				{ subtree }
			</li>
		));
	}

	static propTypes = {
		canDrop: PropTypes.bool,
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		className: PropTypes.string,
		connectDragSource: PropTypes.func,
		connectDropTarget: PropTypes.func,
		hideTwisty: PropTypes.bool,
		isDragging: PropTypes.bool,
		isOpen: PropTypes.bool,
		isOver: PropTypes.bool,
		onClick: PropTypes.func,
		onOpen: PropTypes.func,
		onRename: PropTypes.func,
		onDrag: PropTypes.func,
		subtree: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	}

	static defaultProps = {
		onClick: noop,
		onOpen: noop,
	}
}

export default Node;

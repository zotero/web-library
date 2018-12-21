'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('../ui/icon');
const { noop } = require('../../utils');
const { ITEM } = require('../../constants/dnd');
const { omit } = require('../../common/immutable');
const { isTriggerEvent } = require('../../common/event');
const {
	DropTarget,
	DropTargetConnector,
	DropTargetMonitor,
} = require('react-dnd');

const dndSpec = {
	drop(props, monitor) {
		if(monitor.isOver({ shallow: true })) {
			const { dndTarget } = props;
			return dndTarget;
		}
	},
	canDrop({ dndTarget = {} }) {
		return dndTarget.targetType === 'collection';
	}
}

const dndCollect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget(),
	isOver: monitor.isOver({ shallow: true }),
	canDrop: monitor.canDrop(),
});

@DropTarget(ITEM, dndSpec, dndCollect)
class Node extends React.PureComponent {

	handleToggleInteraction(ev) {
		ev && ev.stopPropagation();
		if(isTriggerEvent(ev, true)) {
			this.props.onOpen();
		}
	}

	render() {
		const {
			canDrop,
			children,
			className,
			connectDropTarget,
			hideTwisty,
			isOpen,
			isOver,
			subtree,
		} = this.props;

		const twistyButton = (
			<button
				type="button"
				className="twisty"
				onClick={ ev => this.handleToggleInteraction(ev) }
				onKeyDown={ ev => this.handleToggleInteraction(ev) }
			>
				<Icon type={ '16/triangle' } width="16" height="16" />
			</button>
		);
		const isActive = canDrop && isOver;
		const props = omit(this.props, ["canDrop", "children", "className",
			"connectDropTarget", "dndTarget", "hideTwisty", "isOpen", "isOver",
			"onOpen", "subtree"
		]);

		return connectDropTarget(
			<li
				className={ className }
				>
				<div
					className={ cx('item-container', { 'dnd-target': isActive }) }
					role="treeitem"
					aria-expanded={ isOpen }
					{ ...props }
				>
					{ subtree && !hideTwisty ? twistyButton : null }
					{ children }
				</div>
				{ subtree }
			</li>
		);
	}

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		className: PropTypes.string,
		hideTwisty: PropTypes.bool,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		onKeyPress: PropTypes.func,
		onOpen: PropTypes.func,
		subtree: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	}

	static defaultProps = {
		onClick: noop,
		onKeyPress: noop,
		onOpen: noop,
	}
}

module.exports = Node;

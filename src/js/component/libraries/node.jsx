'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const Icon = require('../ui/icon');
const { noop } = require('../../utils');
const { ITEM } = require('../../constants/dnd');
const {
	DropTarget,
	DropTargetConnector,
	DropTargetMonitor,
	ConnectDropTarget,
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
	render() {
		const {
			canDrop,
			children,
			className,
			connectDropTarget,
			hideTwisty,
			isOpen,
			isOver,
			onClick,
			onKeyPress,
			onOpen,
			subtree,
		} = this.props;

		const twistyButton = <button
			type="button"
			className="twisty"
			onClick={ onOpen }
			onKeyPress={ ev => ev.stopPropagation() }
		/>;
		const isActive = canDrop && isOver;

		return connectDropTarget(
			<li
				className={ className }
				>
				<div
					className={ cx('item-container', { 'dnd-target': isActive }) }
					onClick={ onClick }
					onKeyPress={ onKeyPress }
					role="treeitem"
					tabIndex="0"
					aria-expanded={ isOpen }
				>
					<div className="twisty-container">
						{ subtree && !hideTwisty ? twistyButton : null }
					</div>
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

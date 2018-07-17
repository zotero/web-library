'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const Icon = require('../ui/icon');
const { noop } = require('../../utils');

class Node extends React.PureComponent {
	render() {
		const {
			children,
			className,
			isOpen,
			label,
			onClick,
			onKeyPress,
			onOpen,
			icon,
		} = this.props;

		console.log(children);

		const twistyButton = children !== null ? (
			<button
				type="button"
				className="twisty"
				onClick={ onOpen }
				onKeyPress={ ev => ev.stopPropagation() }
			/>
		) : null;

		return (
			<li
				className={ className }
				>
				<div
					className="item-container"
					onClick={ onClick }
					onKeyPress={ onKeyPress }
					role="treeitem"
					tabIndex="0"
					aria-expanded={ isOpen }
				>
					<div className="twisty-container">
						{ children && twistyButton }
					</div>
					<Icon type={`28/${icon}`} className="touch" width="28" height="28"/>
					<Icon type={`16/${icon}`} className="mouse" width="16" height="16"/>
					<a>
						{ label }
					</a>
				</div>
				{ children }
			</li>
		);
	}

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
		className: PropTypes.string,
		icon: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		label: PropTypes.string,
		onClick: PropTypes.func,
		onKeyPress: PropTypes.func,
		onOpen: PropTypes.func,
	}

	static defaultProps = {
		onClick: noop,
		onKeyPress: noop,
		onOpen: noop,
	}
}

module.exports = Node;

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');
const { noop } = require('../../utils');

class Field extends React.PureComponent {
	handleClick() {
		this.props.onClick();
	}
	handleFocus() {
		this.props.onFocus();
	}
	render() {
		const [label, value] = React.Children.toArray(this.props.children);
		return (
			<li
				className={ cx('metadata', this.props.className) }
			>
				<div className="key">
					{ label }
				</div>
				<div tabIndex={ this.props.isActive ? null : this.props.tabIndex }
					className="value"
					onFocus={ this.handleFocus.bind(this) }
					onClick={ this.handleClick.bind(this) }>
					{ value }
				</div>
			</li>
		);
	}

	static defaultProps = {
		onFocus: noop,
		onClick: noop,
		tabIndex: 0,
	};

	static propTypes = {
		children: PropTypes.array.isRequired,
		className: PropTypes.string,
		isActive: PropTypes.bool,
		onClick: PropTypes.func.isRequired,
		onFocus: PropTypes.func.isRequired,
		tabIndex: PropTypes.number,
	};
}

module.exports = Field;
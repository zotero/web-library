'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

class Field extends React.PureComponent {
	render() {
		const [label, value] = React.Children.toArray(this.props.children);
		return (
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
		isActive: PropTypes.bool,
	};
}

module.exports = Field;
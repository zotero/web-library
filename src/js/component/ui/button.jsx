'use strict';

const cx = require('classnames');
const Icon = require('./icon');
const PropTypes = require('prop-types');
const React = require('react');
const { noop } = require('../../utils');

class Button extends React.PureComponent {
	render() {
		const { children, onClick, className, ...props } = this.props;
		const classNames = cx('btn', className, {
			'btn-icon': React.Children.toArray(this.props.children).some(c => c.type === Icon)
		});
		return (
			<button
				className={ classNames }
				onFocus={ this.props.onFocus }
				onBlur={ this.props.onBlur }
				onClick={ onClick } { ...props }>
				{ children }
			</button>
		);
	}

	static defaultProps = {
		onBlur: noop,
		onClick: noop,
		onFocus: noop,
	}

	static propTypes = {
		children: PropTypes.node,
		className: PropTypes.string,
		onBlur: PropTypes.func,
		onClick: PropTypes.func,
		onFocus: PropTypes.func,
	}
}

module.exports = Button;

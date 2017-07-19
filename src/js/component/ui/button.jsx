'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const Icon = require('./icon');

class Button extends React.Component {
	render() {
		return (
			<button 
				className={ cx(this.props.className, 'btn', {
					'active': this.props.active,
					'btn-icon': React.Children.toArray(this.props.children).some(c => c.type === Icon)
				})}
				onClick={ ev => typeof this.props.onClick === 'function' && this.props.onClick(ev) } >
				{ this.props.children }
			</button>
		);
	}
}

Button.propTypes = {
	active: PropTypes.bool,
	children: PropTypes.node,
	className: PropTypes.string,
	onClick: PropTypes.func
};


Button.defaultProps = {
	active: false
};

module.exports = Button;

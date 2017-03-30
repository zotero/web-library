'use strict';

import React from 'react';
import cx from 'classnames';

import Icon from './icon';

export default class Button extends React.Component {
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
	active: React.PropTypes.bool,
	children: React.PropTypes.node,
	className: React.PropTypes.string,
	onClick: React.PropTypes.func
};


Button.defaultProps = {
	active: false
};

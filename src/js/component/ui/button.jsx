'use strict';

import cx from 'classnames';
import Icon from './icon';
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from '../../utils';

class Button extends React.PureComponent {
	render() {
		const { children, onClick, className, icon, ...props } = this.props;
		const classNames = cx('btn', className, {
			'btn-icon': icon
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
		icon: PropTypes.bool,
		onBlur: PropTypes.func,
		onClick: PropTypes.func,
		onFocus: PropTypes.func,
	}
}

export default Button;

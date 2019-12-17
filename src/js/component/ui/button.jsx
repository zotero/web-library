import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo } from 'react';

import { noop } from '../../utils';

const Button = memo(forwardRef((props, ref) => {
	const { children, className, icon, ...rest } = props;
		const classNames = cx('btn', className, {
			'btn-icon': icon
		});
		return (
			<button
				className={ classNames }
				ref={ ref }
				{ ...rest }
			>
				{ children }
			</button>
		);
}));

Button.displayName = "Button";

Button.defaultProps = {
	onBlur: noop,
	onClick: noop,
	onFocus: noop,
};

Button.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	icon: PropTypes.bool,
	onBlur: PropTypes.func,
	onClick: PropTypes.func,
	onFocus: PropTypes.func,
};

export default Button;

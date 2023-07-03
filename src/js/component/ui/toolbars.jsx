import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { pick } from 'web-common/utils';

const Toolbar = forwardRef(({ children, className, tabIndex, onFocus, onBlur, ...rest }, ref) => (
	<div
		className={cx('toolbar', className)}
		onBlur={ onBlur }
		onFocus={ onFocus }
		ref={ ref }
		role="toolbar"
		tabIndex={ tabIndex }
		{ ...pick(rest, p => p.startsWith('aria-') || p.startsWith('data-')) }
	>
		{ children }
	</div>
));

Toolbar.displayName = 'Toolbar';

Toolbar.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    tabIndex: PropTypes.number
};

const ToolGroup = ({ children }) => (
	<div className="tool-group">
		{ children }
	</div>
);

ToolGroup.propTypes = {
	children: PropTypes.node
};


export {
	Toolbar,
	ToolGroup
};

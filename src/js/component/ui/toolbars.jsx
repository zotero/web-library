import { forwardRef } from 'react';
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

const ToolGroup = ({ children }) => (
	<div className="tool-group">
		{ children }
	</div>
);


export {
	Toolbar,
	ToolGroup
};

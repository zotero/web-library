import { memo, useRef } from 'react';
import { useFocusManager } from 'web-common/hooks';

import ColumnSelector from './column-selector';
import { ItemActionsDesktop } from './../actions';
import { Toolbar } from '../../ui/toolbars';

const ItemsTableToolbar = () => {
	const ref = useRef();
	const { focusNext, focusPrev, focusBySelector, receiveFocus, receiveBlur } = useFocusManager(ref);

	return (
		<header className="hidden-sm-down">
			<Toolbar
				aria-label="items toolbar"
				className="hidden-touch hidden-sm-down"
				onFocus={receiveFocus}
				onBlur={receiveBlur}
				tabIndex={0}
				ref={ref}
			>
				<div className="toolbar-left">
					<ItemActionsDesktop onFocusNext={focusNext} onFocusPrev={focusPrev} onFocusBySelector={focusBySelector} />
				</div>
				<div className="toolbar-right">
					<ColumnSelector tabIndex={-2} onFocusNext={focusNext} onFocusPrev={focusPrev} />
				</div>
			</Toolbar>
		</header>
	);
}

export default memo(ItemsTableToolbar);

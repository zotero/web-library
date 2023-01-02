import React, { memo, useRef } from 'react';

import ColumnSelector from './column-selector';
import ItemsActions from './../actions';
import { Toolbar } from '../../ui/toolbars';
import { useFocusManager } from '../../../hooks';

const ItemsTableToolbar = () => {
	const ref = useRef();
	const { focusNext, focusPrev, receiveFocus, receiveBlur } = useFocusManager(ref);

	return (
		<header className="hidden-sm-down">
			<Toolbar
				aria-label="items toolbar"
				className="hidden-touch hidden-sm-down"
				onFocus={ receiveFocus }
				onBlur={ receiveBlur }
				tabIndex={ 0 }
				ref={ ref }
			>
				<div className="toolbar-left">
					<ItemsActions onFocusNext={ focusNext } onFocusPrev={ focusPrev } />
				</div>
				<div className="toolbar-right">
				<ColumnSelector tabIndex={ -2 } onFocusNext={ focusNext } onFocusPrev={ focusPrev } />
				</div>
			</Toolbar>
		</header>
	);
}

export default memo(ItemsTableToolbar);

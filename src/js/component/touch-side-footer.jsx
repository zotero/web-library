import React, { memo, useCallback } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import { Toolbar } from './ui/toolbars';
import Button from './ui/button';
import Icon from './ui/icon';
import { pluralize } from '../common/format';
import { toggleTouchTagSelector } from '../actions';

const TouchSideFooter = memo(() => {
	const dispatch = useDispatch();
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual);
	const isOpen = useSelector(state => state.current.isTouchTagSelectorOpen);
	const isSearchMode = useSelector(state => state.current.isSearchMode);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);

	const handleClick = useCallback(() => {
		dispatch(toggleTouchTagSelector(!isOpen));
	});

	const footer = <footer className="touch-footer darker">
			<Toolbar>
				<div className="toolbar-left">
					<Button className="btn-icon" onClick={ handleClick }>
						<Icon
							type="24/tag"
							symbol={ selectedTagNames.length === 0 ? 'tag' : 'tag-block' }
							width="24"
							height="24"
						/>
					</Button>
				</div>
				<div className="toolbar-center">
					{ selectedTagNames.length != 0 &&
						`${selectedTagNames.length} ${pluralize('Tag', selectedTagNames.length)} Selected`
					}
				</div>
				<div className="toolbar-right" />
			</Toolbar>
		</footer>

	return isSingleColumn ? (
		<CSSTransition
			in={ isSearchMode }
			timeout={ 250 }
			classNames="fade"
			mountOnEnter
			unmountOnExit
		>
			{ footer }
		</CSSTransition>
	) : footer;
});

TouchSideFooter.displayName = 'TouchSideFooter';

export default TouchSideFooter;

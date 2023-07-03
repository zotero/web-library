import { memo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Button, Icon } from 'web-common/components';

import { Toolbar } from './ui/toolbars';
import { pluralize } from '../common/format';
import { toggleTouchTagSelector } from '../actions';

const TouchSideFooter = memo(() => {
	const dispatch = useDispatch();
	const selectedTagNames = useSelector(state => state.current.tags, shallowEqual);
	const isOpen = useSelector(state => state.current.isTouchTagSelectorOpen);
	const isSingleColumn = useSelector(state => state.device.isSingleColumn);
	const isTagsSelected = selectedTagNames.length > 0;

	const handleClick = useCallback(() => {
		dispatch(toggleTouchTagSelector(!isOpen));
	}, [dispatch, isOpen]);

	return ((isSingleColumn && isTagsSelected) || !isSingleColumn) ? (
		<footer className="touch-footer darker">
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
	) : null;
});

TouchSideFooter.displayName = 'TouchSideFooter';

export default TouchSideFooter;

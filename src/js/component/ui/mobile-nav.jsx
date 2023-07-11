import React, { memo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusManager } from 'web-common/hooks';

import MobileMenuEntry from './menu-entry-mobile';
import { toggleNavbar } from '../../actions';

const MobileNav = () => {
	const dispatch = useDispatch();
	const entries = useSelector(state => state.config.menus.mobile);
	const ref = useRef(null);
	const { focusNext, focusPrev, receiveBlur, receiveFocus } = useFocusManager(ref);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}
		if(ev.key === 'ArrowDown') {
			focusNext(ev);
		} else if(ev.key === 'ArrowUp') {
			focusPrev(ev);
		}
	}, [focusNext, focusPrev]);

	const handleBlur = useCallback(ev => {
		if(receiveBlur(ev)) {
			dispatch(toggleNavbar(false));
		}
	}, [dispatch, receiveBlur]);

	return (
		<header
			className="nav-sidebar"
			onBlur={ handleBlur }
			onFocus={ receiveFocus }
			ref={ ref }
			tabIndex={ -1 }
		>
			<nav>
				<ul className="mobile-nav">
					{ entries.map( entry => (
						<MobileMenuEntry
							key={ entry.href }
							onKeyDown={ handleKeyDown }
							{ ...entry }
						/>
					))}
				</ul>
			</nav>
		</header>
	);
}

export default memo(MobileNav);

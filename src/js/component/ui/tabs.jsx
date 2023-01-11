import React, { forwardRef, memo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classnames';

import Spinner from '../ui/spinner';
import { pick } from '../../common/immutable';
import { mapChildren } from '../../common/react';
import { useFocusManager } from '../../hooks';
import { noop } from '../../utils';

const Tab = memo(props => {
	const { activateOnFocus, children, isActive, isDisabled, onActivate, focusNext, focusPrev,
	resetLastFocused, ...rest } = props;

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			const focused = focusNext(ev);
			if(activateOnFocus) {
				onActivate(focused);
			}
		} else if(ev.key === 'ArrowLeft') {
			const focused = focusPrev(ev);
			if(activateOnFocus) {
				onActivate(focused);
			}
		}
	}, [activateOnFocus, focusNext, focusPrev, onActivate]);

	const handleClick = useCallback(ev => {
		ev.preventDefault();
		if(isDisabled) {
			return;
		}
		resetLastFocused();
		onActivate(ev.currentTarget);
	}, [resetLastFocused, isDisabled, onActivate]);

	return (
		<li
			className={ cx({
				tab: true,
				active: isActive,
				disabled: isDisabled
			}) }
		>
			<a href=""
				{ ... pick(rest, p => p.startsWith('data-')) }
				onClick={ handleClick }
				onKeyDown={ handleKeyDown }
				role="tab"
				tabIndex={ -2 }
			>
				{ children }
			</a>
		</li>
	);
});

Tab.displayName = 'Tab';

Tab.propTypes = {
	activateOnFocus: PropTypes.bool,
	children: PropTypes.node,
	focusNext: PropTypes.func,
	focusPrev: PropTypes.func,
	isActive: PropTypes.bool,
	isDisabled: PropTypes.bool,
	onActivate: PropTypes.func.isRequired,
	resetLastFocused: PropTypes.func,
};


const Tabs = memo(({ children, justified, compact, activateOnFocus, ...rest }) => {
	const ref = useRef(null);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const { focusNext, focusPrev, receiveFocus, receiveBlur, resetLastFocused } =
	useFocusManager(ref, '.tab.active > a');

	return (
		<nav>
			<ul
				className={ cx('nav', 'tabs', { justified, compact, 'activate-on-focus': activateOnFocus  }) }
				onBlur={ isTouchOrSmall ? noop : receiveBlur }
				onFocus={ isTouchOrSmall ? noop : receiveFocus }
				ref={ ref }
				role={isTouchOrSmall ? null : "tablist"}
				tabIndex={ isTouchOrSmall ? -1 : 0 }
				{...pick(rest, p => p.startsWith('aria-') || p.startsWith('data-'))}
			>
				{
					mapChildren(children, child =>
						child && child.type === Tab ?
							React.cloneElement(child, { activateOnFocus, focusNext, focusPrev, resetLastFocused }) :
							child
					)
				}
			</ul>
		</nav>
	);
});

Tabs.displayName = 'Tabs';

Tabs.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	compact: PropTypes.bool,
	justified: PropTypes.bool,
	activateOnFocus: PropTypes.bool,
};

const TabPane = memo(forwardRef(({ children, isActive, isLoading, className, ...rest }, ref) => (
	<div ref={ ref } className={ cx(className, {
		'tab-pane': true,
		'active': isActive,
		'loading': isLoading
	}) } { ...rest }>
		{ isLoading ? <Spinner /> : children  }
	</div>
)));

TabPane.displayName = 'TabPane';

TabPane.propTypes = {
	children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
	className: PropTypes.string,
	isActive: PropTypes.bool,
	isLoading: PropTypes.bool,
};


export {
	Tab,
	Tabs,
	TabPane
};

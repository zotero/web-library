'use strict';

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import withFocusManager from '../../enhancers/with-focus-manager';
import Spinner from '../ui/spinner';
import { pick } from '../../common/immutable';

const Tab = props => {
	const { children, isActive, isDisabled, onActivate, onFocusNext, onFocusPrev, ...rest } = props;

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	});

	const handleClick = useCallback(ev => {
		ev.preventDefault();
		if(isDisabled) {
			return;
		}
		onActivate(ev);
	});

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
}

Tab.propTypes = {
	children: PropTypes.node,
	isActive: PropTypes.bool,
	isDisabled: PropTypes.bool,
	onActivate: PropTypes.func.isRequired
};


const mapChildren = (children, mapFunc, out = []) => {
	React.Children.toArray(children).reduce((out, child) => {
		if(child.type === React.Fragment) {
			mapChildren(child.props.children, mapFunc, out);
		} else {
			out.push(mapFunc(child));
		}
		return out;
	}, out);
	return out;
}

const Tabs = withFocusManager(({ children, justified, compact, onFocus, onBlur,
	registerFocusRoot, onFocusNext, onFocusPrev }) => (
	<nav>
		<ul
			className={ cx('nav', 'tabs', { justified, compact }) }
			onBlur={ onBlur }
			onFocus={ onFocus }
			ref={ ref => registerFocusRoot(ref) }
			role="tablist"
			tabIndex={ 0 }
		>
			{
				mapChildren(children, child =>
					child && child.type === Tab ? React.cloneElement(child, { onFocusNext, onFocusPrev }) : child
				)
			}
		</ul>
	</nav>
));

Tabs.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
	compact: PropTypes.bool,
	justified: PropTypes.bool
};

const TabPane = React.forwardRef(({ children, isActive, isLoading, className, ...rest }, ref) => (
	<div ref={ ref } className={ cx(className, {
		'tab-pane': true,
		'active': isActive,
		'loading': isLoading
	}) } { ...rest }>
		{ isLoading ? <Spinner /> : children  }
	</div>
));

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

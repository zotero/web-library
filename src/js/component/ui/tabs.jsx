'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import withFocusManager from '../../enhancers/with-focus-manager';

const Tab = ({ children, isActive, isDisabled, onActivate, onFocusNext, onFocusPrev }) => {
	const handleKeyDown = ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	};
	return (
		<li
			className={ cx({
				tab: true,
				active: isActive,
				disabled: isDisabled
			}) }
			onClick={ isDisabled ? null : onActivate }
		>
			<a href=""
				onClick={ ev => { ev.preventDefault(); isDisabled ? null : onActivate(); } }
				tabIndex={ -2 }
				onKeyDown={ handleKeyDown }
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
			onFocus={ onFocus }
			onBlur={ onBlur }
			tabIndex={ 0 }
			ref={ ref => registerFocusRoot(ref) }
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


export {
	Tab,
	Tabs
};

import cx from 'classnames';
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';
import { usePrevious } from 'web-common/hooks';
import { noop } from 'web-common/utils';
import { Icon } from 'web-common/components';

import { getTouchNavLayout } from '../../common/touch-nav';
import { getTextWidth, readPx } from '../../utils';


const slots = ['next', 'current', 'previous', 'before-last'];
const EMPTY = {
	key: null,
	label: ''
};

const getSlot = (index, length) => {
	let slotIndex = length - index - 1;
	if(slotIndex < slots.length) {
		let slot = slots[slotIndex];
		return slot;
	} else {
		return '';
	}
};

const isPathChanged = (oldPath, newPath) => {
	let pathUnchanged = oldPath.length === newPath.length && oldPath.every(
		(v, i) => v.key === newPath[i].key
	);
	return !pathUnchanged;
};

// Left edge of the buttons in the right-hand toolbar, relative to the navigation
const getToolbarButtonsLeft = nav => {
	const navLeft = nav.getBoundingClientRect().left;
	const buttons = nav.closest('.toolbar')?.querySelectorAll(':scope > .toolbar-right > *') ?? [];
	const buttonsLefts = Array.from(buttons)
		.map(element => element.getBoundingClientRect())
		.filter(rect => rect.width > 0)
		.map(rect => rect.left - navLeft);
	return buttonsLefts.length ? Math.min(...buttonsLefts) : null;
};

const isLayoutChanged = (layoutById, updates) => Object.entries(updates).some(
	([id, update]) => Object.entries(update).some(([key, value]) => layoutById[id]?.[key] !== value)
);

const mapPathToHeaders = (path, previous) => {
	let headers = [ ...path ];

	// add previous node at the end.
	// This is last "current" node when going up the tree, empty otherwise
	headers.push({
		key: previous.key,
		label: previous.label
	});

	// add two empty nodes to cover for root being current
	headers.unshift(EMPTY);
	headers.unshift(EMPTY);

	// assign slots and ids
	headers = headers.map((h, i) => {
		return {
			id: i,
			slot: getSlot(i, headers.length),
			...h
		};
	});

	return headers;
}

const TouchNavigation = props => {
	const { navigationName = "Touch Navigation", onNavigate = noop, path } = props;
	const navRef = useRef(null);
	const iconRef = useRef(null);
	const prevPath = usePrevious(path);
	const [headers, setHeaders] = useState(mapPathToHeaders(path, EMPTY));
	// Keyed by header id. Kept after a header leaves its slot so that the outgoing title keeps its
	// appearance during the transition.
	const [layoutById, setLayoutById] = useState({});
	// Titles only transition when they move between slots, i.e. when the depth of the path changes.
	// The initial layout, titles replaced in place and re-layouts after a resize are applied instantly.
	const [isTransitionEnabled, setIsTransitionEnabled] = useState(false);
	const layoutWidthRef = useRef(null);
	const hasPrevious = headers.some(h => h.slot === 'previous' && h.key != null);

	const updateLayout = useCallback(() => {
		const nav = navRef.current;
		const width = nav?.clientWidth;
		if(!width) {
			return;
		}
		if(layoutWidthRef.current !== null && layoutWidthRef.current !== width) {
			setIsTransitionEnabled(false);
		}
		layoutWidthRef.current = width;
		const current = headers.find(h => h.slot === 'current');
		const previous = headers.find(h => h.slot === 'previous');
		const currentElement = nav.querySelector(`li[data-id="${current.id}"]`);
		const previousElement = nav.querySelector(`li[data-id="${previous.id}"]`);
		const style = getComputedStyle(nav);
		const edge = readPx(style, '--touch-nav-edge');
		const gap = readPx(style, '--touch-nav-gap');
		const toolbarButtonsLeft = getToolbarButtonsLeft(nav);

		const { isPreviousCollapsed, maxWidth, shift } = getTouchNavLayout({
			width,
			edge,
			gap,
			previousOffset: readPx(style, '--touch-nav-previous-offset'),
			rightEdge: toolbarButtonsLeft === null ? width - edge : toolbarButtonsLeft - gap,
			previousWidth: previous.key != null ? getTextWidth(previousElement?.querySelector('.label')) : null,
			backWidth: getTextWidth(previousElement?.querySelector('.back-label')),
			currentWidth: getTextWidth(currentElement?.querySelector('.label')),
		});

		const updates = {
			[current.id]: { maxWidth, shift },
			[previous.id]: { isCollapsed: isPreviousCollapsed },
		};
		setLayoutById(layoutById => {
			if(!isLayoutChanged(layoutById, updates)) {
				return layoutById;
			}
			const newLayoutById = { ...layoutById };
			Object.entries(updates).forEach(([id, update]) => {
				newLayoutById[id] = { ...layoutById[id], ...update };
			});
			return newLayoutById;
		});
	}, [headers]);

	useLayoutEffect(() => {
		updateLayout();
	}, [updateLayout]);

	useEffect(() => {
		if(typeof ResizeObserver === 'undefined') {
			return;
		}
		const resizeObserver = new ResizeObserver(updateLayout);
		resizeObserver.observe(navRef.current);
		return () => resizeObserver.disconnect();
	}, [updateLayout]);

	const handleNavigation = useCallback(ev => {
		const path = headers[ev.currentTarget.dataset.headerId].path;
		ev.preventDefault();
		if(ev.type === 'click' ||
			(ev.type === 'keypress' && (ev.key === 'Enter' || ev.key === ' '))) {
			onNavigate(path, true);
		}
	}, [headers, onNavigate]);

	useEffect(() => {
		if(!prevPath) {
			return;
		}
		if(isPathChanged(path, prevPath)) {
			let previous;
			if(prevPath.length > path.length) {
				previous = headers[headers.length - 2];
			} else {
				previous = EMPTY;
			}
			const newHeaders = mapPathToHeaders(path, previous);
			setHeaders(newHeaders);
			setIsTransitionEnabled(prevPath.length !== path.length);
		}
	}, [headers, path, prevPath]);

	return (
		<nav
			ref={ navRef }
			className={ cx('touch-nav', { 'no-transition': !isTransitionEnabled }) }
			aria-label={ navigationName }
		>
			<CSSTransition
				in={ hasPrevious }
				timeout={ 250 }
				classNames="fade"
				unmountOnExit
				nodeRef={ iconRef }
			>
				<Icon ref={ iconRef } type={ '16/caret-16' } width="16" height="16" className="icon-previous" />
			</CSSTransition>
			<ul>
				{ headers.map((header, index) => {
					if(header.slot) {
						const { isCollapsed, maxWidth, shift } = layoutById[header.id] ?? {};
						const isCentered = header.slot === 'current' || header.slot === 'next';
						const isLeftAligned = header.slot === 'previous' || header.slot === 'before-last';
						const innerStyle = isCentered && maxWidth !== undefined ? {
							maxWidth,
							transform: `translate3d(calc(-50% + ${shift}px), 0, 0)`,
						} : null;
						return (
							<li
								data-id={ header.id}
								className={ cx(header.slot, { collapsed: isLeftAligned && isCollapsed }) }
								key={ header.id }
							>
								<div className="center-axis">
									<div
										data-header-id={ index }
										className="inner"
										style={ innerStyle }
										onClick={ handleNavigation }
										onKeyPress={ handleNavigation }
									>
										<div
											className="title"
											tabIndex={ header.label && header.slot === 'previous' ? 0 : null }>
											<div className="truncate label">
												{ header.label }
											</div>
											<div className="back-label" aria-hidden="true">
												Back
											</div>
										</div>
									</div>
								</div>
							</li>
						);
					} else {
						return null;
					}
				}) }
			</ul>
		</nav>
	)
}

export default memo(TouchNavigation);

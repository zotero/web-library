import PropTypes from 'prop-types';
import React, { memo, useCallback, useEffect, useState } from 'react';
import CSSTransition from 'react-transition-group/cjs/CSSTransition';

import Icon from '../ui/icon';
import { noop } from '../../utils';
import { usePrevious } from '../../hooks';

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
	const { onNavigate = noop, path } = props;
	const prevPath = usePrevious(path);
	const [headers, setHeaders] = useState(mapPathToHeaders(path, EMPTY));
	const hasPrevious = headers.some(h => h.slot === 'previous' && h.key != null);

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
			if(prevPath.length < path.length) {
				previous = headers[headers.length - 2];
			} else {
				previous = EMPTY;
			}
			const newHeaders = mapPathToHeaders(path, previous);
			setHeaders(newHeaders);
		}
	}, [headers, path, prevPath]);

	return (
		<nav className="touch-nav">
			<CSSTransition
				in={ hasPrevious }
				timeout={ 250 }
				classNames="fade"
				unmountOnExit
			>
				<Icon type={ '16/caret-16' } width="16" height="16" className="icon-previous" />
			</CSSTransition>
			<ul>
				{ headers.map((header, index) => {
					if(header.slot) {
						return (
							<li data-id={ header.id} className={ header.slot } key={ header.id }>
								<div className="center-axis">
									<div
										data-header-id={ index }
										className="inner"
										onClick={ handleNavigation }
										onKeyPress={ handleNavigation }
									>
										<div
											className="truncate"
											tabIndex={ header.label && header.slot === 'previous' ? 0 : null }>
											{ header.label }
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

TouchNavigation.propTypes = {
	onNavigate: PropTypes.func,
	path: PropTypes.array,
}

export default memo(TouchNavigation);

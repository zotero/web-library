'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import { noop } from '../utils';
import Icon from './ui/icon';

const slots = ['next', 'current', 'previous', 'before-last'];
const empty = {
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

class TouchNavigation extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			headers: this.mapPathToHeaders(props.path, empty)
		};
	}

	mapPathToHeaders(path, previous) {
		let headers = [ ...path ];

		// add previous node at the end.
		// This is last "current" node when going up the tree, empty otherwise
		headers.push({
			key: previous.key,
			label: previous.label
		});

		// add two empty nodes to cover for root being current
		headers.unshift(empty);
		headers.unshift(empty);

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

	componentDidUpdate({ path: previousPath }) {
		const { path } = this.props;
		if(isPathChanged(path, previousPath)) {
			let previous;
			if(previousPath.length < path.length) {
				previous = this.state.headers[this.state.headers.length - 2];
			} else {
				previous = empty;
			}
			const headers = this.mapPathToHeaders(path, previous);
			this.setState({ headers });
		}
	}

	handleNavigation(path, ev) {
		ev.preventDefault();
		if(ev.type === 'click' ||
			(ev.type === 'keypress' && (ev.key === 'Enter' || ev.key === ' '))) {
			this.props.onNavigation(path, ev);
		}
	}

	render() {
		const hasPrevious = this.state.headers.some(h => h.slot === 'previous' && h.key != null);
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
					{ this.state.headers.map(header => {
						if(header.slot) {
							return (
								<li data-id={ header.id} className={ header.slot } key={ header.id }>
									<div className="center-axis">
										<div
											className="inner"
											onClick={ ev => this.handleNavigation(header.path, ev) }
											onKeyPress={ ev => this.handleNavigation(header.path, ev) }
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
		);
	}

	static propTypes = {
		onNavigation: PropTypes.func,
		path: PropTypes.array,
	}

	static defaultProps = {
		onNavigation: noop,
		path: [],
	}
}
export default TouchNavigation;

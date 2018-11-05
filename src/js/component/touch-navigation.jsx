/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const noop = require('../utils');

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

class TouchNavigation extends React.Component {
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

	componentWillReceiveProps(props) {
		if(isPathChanged(this.props.path, props.path)) {
			let previous;
			if(props.path.length < this.props.path.length) {
				previous = this.state.headers[this.state.headers.length - 2];
			} else {
				previous = empty;
			}

			let headers = this.mapPathToHeaders(props.path, previous);
			this.setState({ headers });
		}
	}

	shouldComponentUpdate(props) {
		return isPathChanged(this.props.path, props.path);
	}

	handleNavigation(path, ev) {
		ev && ev.preventDefault();
		this.props.onNavigation(path, ev);
	}

	render() {
		return (
			<nav>
				<ul>
					{ this.state.headers.map(header => {
						if(header.slot) {
							return (
								<li data-id={ header.id} className={ header.slot } key={ header.id } tabIndex="0">
									<div className="center-axis">
										<div className="inner" onClick={ ev => this.handleNavigation(header.path, ev) }>
											<div className="truncate">
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
module.exports = TouchNavigation;

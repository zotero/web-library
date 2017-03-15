'use strict';

import React from 'react';

const slots = ['next', 'current', 'previous', 'forelast'];
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
	return oldPath.length === newPath.length && oldPath.every(
		(v, i) => v.key === newPath[i].key
	);
};

export default class TouchHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			headers: this.mapPathToHeaders([])
		};
	}

	mapPathToHeaders(path) {
		let headers = path.map(c => ({
			key: c.key,
			label: c.apiObj.data.name
		}));

		// add root path at the begining
		headers.unshift({
			key: null,
			label: '/'
		});

		// add empty node at the end
		headers.push(empty);

		// add to empty nodes to cover for root being current
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

	componentWillReceiveProps(nextProps) {
		if(!isPathChanged(this.props.path, nextProps.path)) {
			let headers = this.mapPathToHeaders(nextProps.path);
			this.setState({ headers });
		}
	}

	shouldComponentUpdate(nextProps) {
		return !isPathChanged(this.props.path, nextProps.path);
	}

	collectionSelectedHandler(key, ev) {
		ev && ev.preventDefault();
		this.props.onCollectionSelected(key, ev);
	}

	render() {
		return (
			<header className="touch-header hidden-sm-up">
				<nav>
					<ul>
						{ this.state.headers.map(header => {
							if(header.slot) {
								return (
									<li data-id={ header.id} className={ header.slot } key={ header.id } tabIndex="0">
										<div>
											<span onClick={ ev => this.collectionSelectedHandler(header.key, ev) }>
												{ header.label }
											</span>
										</div>
									</li>
								);
							} else {
								return null;
							}
						}) }
					</ul>
				</nav>
			</header>
		);
	}
}

TouchHeader.propTypes = {
	onCollectionSelected: React.PropTypes.func,
	path: React.PropTypes.array
};

TouchHeader.defaultProps = {
	path: []
};
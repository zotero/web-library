'use strict';

import React from 'react';

export default class TouchHeader extends React.Component {
	collectionSelectedHandler(key, ev) {
		ev && ev.preventDefault();
		this.props.onCollectionSelected(key, ev);
	}

	//@TODO: Refactor and deduplicate
	render() {
		let forelast = this.props.forelast ? (
			<li className="forelast" tabIndex="0">
				<div>
					<span onClick={ ev => this.collectionSelectedHandler(this.props.forelast.key, ev) }>
						{ this.props.forelast.apiObj.data.name }
					</span>
				</div>
			</li>
		) : '';
		let previous = this.props.previous ? (
			<li className="previous" tabIndex="0">
				<div>
					<span onClick={ ev => this.collectionSelectedHandler(this.props.previous.key, ev) }>
						{ this.props.previous.apiObj.data.name }
					</span>
				</div>
			</li>
		) : this.props.current ? (
			<li className="previous" tabIndex="0">
				<div>
					<span onClick={ ev => this.collectionSelectedHandler(null, ev) }>
						/
					</span>
				</div>
			</li>
		) : '';

		let current = this.props.current ? (
			<li className="current" tabIndex="0">
				<div>
					<span onClick={ ev => this.collectionSelectedHandler(this.props.current.key, ev) }>
						{ this.props.current.apiObj.data.name }
					</span>
				</div>
			</li>
		) : (
			<li className="current" tabIndex="0">
				<div>
					<span onClick={ ev => this.collectionSelectedHandler(null, ev) }>
						/
					</span>
				</div>
			</li>
		);

		let next = this.props.next ? (
			<li className="next" tabIndex="0">
				<div>
					<span onClick={ ev => this.collectionSelectedHandler(this.props.next.key, ev) }>
						{ this.props.next.apiObj.data.name }
					</span>
				</div>
			</li>
		) : '';

		return (
			<header className="touch-header hidden-sm-up">
				<nav>
					<ul>
						{ forelast }
						{ previous }
						{ current }
						{ next }
					</ul>
				</nav>
			</header>
		);
	}
}

TouchHeader.propTypes = {
	onCollectionSelected: React.PropTypes.func,
	forelast: React.PropTypes.object,
	previous: React.PropTypes.object,
	current: React.PropTypes.object,
	next: React.PropTypes.object
};
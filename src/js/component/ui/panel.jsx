'use strict';

import React from 'react';

export default class Panel extends React.Component {

	renderHeader(header) {
		if(header.type === 'header') {
			return React.cloneElement(header, {
				className: 'panel-header'
			});
		} else {
			return (
				<header className="panel-header">
					{ React.cloneElement(header) }
				</header>
			);
		}
	}

	renderBody(body) {
		return (
			<div className="panel-body">
				{ body }
			</div>
		);
	}
	
	render() {
		const [header, ...body] = React.Children.toArray(this.props.children);

		return (
			<section className={ `panel ${this.props.className}` }>
				{ this.renderHeader(header) }
				{ this.renderBody(body) }
			</section>
		);
	}
}

Panel.propTypes = {
	children: React.PropTypes.node,
	className: React.PropTypes.string
};

Panel.defaultProps = {
	children: null,
	className: ''
};
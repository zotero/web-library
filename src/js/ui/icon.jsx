'use strict';

import React from 'react';

export default class Icon extends React.Component {
	render() {
		let style = {};
		if(this.props.width) {
			style = Object.assign(style, {
				width: this.props.width
			});
		}

		if(this.props.height) {
			style = Object.assign(style, {
				height: this.props.height
			});
		}

		if(this.props.color) {
			style = Object.assign(style, {
				color: this.props.color
			});
		}

		if(this.props.style) {
			style = Object.assign(style, this.props.style);
		}

		return (
				<svg className="svg-icon" style={ style } aria-label={ this.props.label } role="img">
					<use xlinkHref={ `/icons/${this.props.type}.svg#${this.props.type}`} viewBox="0 0 512 512" />
				</svg>
		);
	}
}

Icon.propTypes = {
	type: React.PropTypes.string.isRequired,
	label: React.PropTypes.string,
	width: React.PropTypes.number,
	height: React.PropTypes.number,
	color: React.PropTypes.string,
	style: React.PropTypes.object
};

Icon.defaultProps = {
	
};
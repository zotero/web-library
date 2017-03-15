'use strict';

import React from 'react';
import cx from 'classnames';

const coerceDimensions = props => ({
	width: parseInt(props.width),
	height: parseInt(props.height)
});

export default class Icon extends React.Component {
	constructor(props) {
		super(props);
		this.state = coerceDimensions(props);
	}

	componentWillReceiveProps(nextProps) {
		this.setState(coerceDimensions(nextProps));
	}

	render() {
		let style = {};
		let basename = this.props.type.split(/[\\/]/).pop();
		if(this.props.width) {
			style = Object.assign(style, {
				width: `${this.props.width}px`
			});
		}

		if(this.props.height) {
			style = Object.assign(style, {
				height: `${this.props.height}px`
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

		let svgAttr = {
			className: cx(['svg-icon', `icon-${basename}`, this.props.className]),
			role: 'img',
			style
		};

		if(this.props.label) {
			svgAttr['aria-label'] = this.props.label;
		}

		return (
			<svg { ...svgAttr }>
				<use xlinkHref={ `/icons/${this.props.type}.svg#${basename}`} viewBox="0 0 512 512" />
			</svg>
		);
	}
}

Icon.propTypes = {
	type: React.PropTypes.string.isRequired,
	label: React.PropTypes.string,
	width: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
	height: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
	color: React.PropTypes.string,
	style: React.PropTypes.object,
	className: React.PropTypes.string
};

Icon.defaultProps = {
	
};
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

const coerceDimensions = props => ({
	width: parseInt(props.width),
	height: parseInt(props.height)
});

class Icon extends React.Component {
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
			className: cx(['icon', `icon-${basename}`, this.props.className]),
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
	type: PropTypes.string.isRequired,
	label: PropTypes.string,
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	color: PropTypes.string,
	style: PropTypes.object,
	className: PropTypes.string
};

Icon.defaultProps = {

};

module.exports = Icon;
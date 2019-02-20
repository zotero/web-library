'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const cx = require('classnames');

class Icon extends React.PureComponent {
	render() {
		const style = {
			color: this.props.color,
			...this.props.style
		};
		const basename = this.props.type.split(/[\\/]/).pop();
		const symbol = this.props.symbol || basename;

		const svgAttr = {
			className: cx(['icon', `icon-${basename}`, this.props.className]),
			role: 'img',
			style
		};

		if(this.props.width) {
			svgAttr['width'] = parseInt(this.props.width, 10);
		}

		if(this.props.height) {
			svgAttr['height'] = parseInt(this.props.height, 10);
		}

		if(this.props.viewBox) {
			svgAttr['viewBox'] = this.props.viewBox;
		}

		if(this.props.label) {
			svgAttr['aria-label'] = this.props.label;
		}

		return (
			<svg { ...svgAttr } viewBox={ this.props.viewBox}>
				<use
					xlinkHref={ `/static/icons/${this.props.type}.svg#${symbol}`}
				/>
			</svg>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		color: PropTypes.string,
		height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		label: PropTypes.string,
		style: PropTypes.object,
		symbol: PropTypes.string,
		type: PropTypes.string.isRequired,
		viewBox: PropTypes.string,
		width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	}
}

module.exports = Icon;

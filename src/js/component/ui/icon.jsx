import React, { memo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const Icon = props => {
	const { className, color, height, label, type, viewBox, width } = props;
	const style = { color, ...props.style };
	const basename = type.split(/[\\/]/).pop();
	const symbol = props.symbol || basename;

	const svgAttr = {
		className: cx(['icon', `icon-${basename}`, className]),
		role: 'img',
		style
	};

	if(width) {
		svgAttr['width'] = parseInt(width, 10);
	}

	if(height) {
		svgAttr['height'] = parseInt(height, 10);
	}

	if(viewBox) {
		svgAttr['viewBox'] = viewBox;
	}

	if(label) {
		svgAttr['aria-label'] = label;
	}

	return (
		<svg { ...svgAttr } viewBox={ viewBox}>
			<use xlinkHref={ `/static/icons/${type}.svg#${symbol}`} />
		</svg>
	);
}

Icon.propTypes = {
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

export default memo(Icon);

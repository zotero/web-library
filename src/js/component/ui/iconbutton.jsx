'use strict';

import React from 'react';
import cx from 'classnames';
import omit from 'lodash.omit';

import Icon from './icon';


export default class IconButton extends React.Component {
	render() {
		return (
			<button className={ cx('btn', 'btn-icon', this.props.className) }>
				<Icon className={ this.props.iconClassName } { ...omit(this.props, ['className']) } />
			</button>
		);
	}
}

IconButton.propTypes = {
	type: React.PropTypes.string.isRequired,
	label: React.PropTypes.string,
	width: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
	height: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
	color: React.PropTypes.string,
	style: React.PropTypes.object,
	className: React.PropTypes.string,
	iconClassName: React.PropTypes.string
};

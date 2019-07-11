'use strict';

import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { DropdownMenu, DropdownItem } from 'reactstrap';
import { noop } from '../../utils';

const colors = [
"#000000", "#993300", "#333300", "#003300", "#003366", "#000080", "#333399",
"#333333", "#800000", "#ff6600", "#808000", "#008000", "#008080", "#0000ff",
"#666699", "#808080", "#ff0000", "#ff9900", "#99cc00", "#339966", "#33cccc",
"#3366ff", "#800080", "#999999", "#ff00ff", "#ffcc00", "#ffff00", "#00ff00",
"#00ffff", "#00ccff", "#993366", "#ffffff", "#ff99cc", "#ffcc99", "#ffff99",
"#ccffcc", "#ccffff", "#99ccff", "#cc99ff", null];

class ColorPicker extends React.PureComponent {
	handleClick = ev => {
		const color = ev.currentTarget.dataset.color;
		this.props.onColorPicked(color);
	}
	render() {
		return (
			<DropdownMenu className="color-picker">
				{
					colors.map(color => (
						<DropdownItem
							onClick={ this.handleClick }
							data-color={ color }
							key={ color ? color : 'clear' }
							className={ cx('color-picker-option', { clear: color === null })}
							style={ { backgroundColor: color } }
						/>
					))
				}
			</DropdownMenu>
		)
	}

	static propTypes = {
		onColorPicked: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onColorPicked: noop,
	};
}

export default ColorPicker;

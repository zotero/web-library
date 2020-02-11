import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { DropdownMenu } from 'reactstrap';
import { noop } from '../../utils';

const colors = [
"#111111", "#993300", "#333300", "#003300", "#003366", "#000080", "#333399", "#333333",
"#800000", "#ff6600", "#808000", "#008000", "#008080", "#0000ff", "#666699", "#808080",
"#ff0000", "#ff9900", "#99cc00", "#339966", "#33cccc", "#3366ff", "#800080", "#999999",
"#ff00ff", "#ffcc00", "#ffff00", "#00ff00", "#00ffff", "#00ccff", "#993366", "#ffffff",
"#ff99cc", "#ffcc99", "#ffff99", "#ccffcc", "#ccffff", "#99ccff", "#cc99ff", null];

const ColorPicker = props => {
	const { onColorPicked } = props;
	const { onDrillDownNext, onDrillDownPrev } = props; // focusManager

	const handleClick = useCallback(ev => {
		const color = ev.currentTarget.dataset.color;
		onColorPicked(color);
	});

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowRight') {
			onDrillDownNext(ev);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowLeft') {
			onDrillDownPrev(ev);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowDown') {
			onDrillDownNext(ev, 8);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowUp') {
			onDrillDownPrev(ev, 8);
			ev.stopPropagation();
		}
	});

	return (
		<DropdownMenu className="color-picker" onKeyDown={ handleKeyDown }>
			{
				colors.map((color, index) => (
					<button
						className={ cx('color-picker-option', { clear: color === null })}
						data-color={ color }
						data-index={ index }
						key={ color ? color : 'clear' }
						onClick={ handleClick }
						role="menuitem"
						style={ { backgroundColor: color } }
						tabIndex={ -3 }
						type="button"
					/>
				))
			}
		</DropdownMenu>
	);
}

ColorPicker.propTypes = {
	onColorPicked: PropTypes.func.isRequired,
	onDrillDownNext: PropTypes.func.isRequired,
	onDrillDownPrev: PropTypes.func.isRequired,
};

ColorPicker.defaultProps = {
	onColorPicked: noop
};

export default ColorPicker;

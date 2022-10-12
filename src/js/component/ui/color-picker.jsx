import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback } from 'react';
import DropdownMenu from 'reactstrap/es/DropdownMenu';
import { noop } from '../../utils';

const ColorPicker = props => {
	const { colors, onColorPicked = noop, gridCols } = props;
	const { onDrillDownNext, onDrillDownPrev } = props; // focusManager

	const handleClick = useCallback(ev => {
		const color = ev.currentTarget.dataset.color;
		onColorPicked(color);
	}, [onColorPicked]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowRight') {
			onDrillDownNext(ev);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowLeft') {
			onDrillDownPrev(ev);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowDown') {
			onDrillDownNext(ev, gridCols);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowUp') {
			onDrillDownPrev(ev, gridCols);
			ev.stopPropagation();
		}
	}, [onDrillDownNext, onDrillDownPrev, gridCols]);

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
	gridCols: PropTypes.number,
	colors: PropTypes.array,
	onColorPicked: PropTypes.func.isRequired,
	onDrillDownNext: PropTypes.func.isRequired,
	onDrillDownPrev: PropTypes.func.isRequired,
};

export default memo(ColorPicker);

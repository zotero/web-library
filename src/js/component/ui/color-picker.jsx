import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback } from 'react';
import { DropdownMenu } from 'reactstrap';
import { noop } from '../../utils';

const ColorPicker = props => {
	const { colors, onColorPicked } = props;
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
			onDrillDownNext(ev, 8);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowUp') {
			onDrillDownPrev(ev, 8);
			ev.stopPropagation();
		}
	}, [onDrillDownNext, onDrillDownPrev]);

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
	colors: PropTypes.array,
	onColorPicked: PropTypes.func.isRequired,
	onDrillDownNext: PropTypes.func.isRequired,
	onDrillDownPrev: PropTypes.func.isRequired,
};

ColorPicker.defaultProps = {
	onColorPicked: noop
};

export default memo(ColorPicker);

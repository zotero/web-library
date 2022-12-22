import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useFloating, shift } from '@floating-ui/react-dom';

import Button from './button';
import Icon from './icon';
import { useEffect } from 'react';
import { useFocusManager, usePrevious } from '../../hooks';
import { isTriggerEvent } from '../../common/event';

const gridCols = 3;

const ColorPicker = props => {
	const { colors, onKeyDown, onColorPicked, selectedColor, tabIndex = 0 } = props;
	const [isOpen, setIsOpen] = useState(false);
	const wasOpen = usePrevious(isOpen);
	const ref = useRef(null);
	const menuRef = useRef(null);

	const { x, y, reference, floating, strategy, update } = useFloating({
		placement: 'bottom', middleware: [shift()]
	});

	const { focusNext, focusPrev, receiveFocus, receiveBlur } = useFocusManager(menuRef, `[role="menuitem"][data-color="${selectedColor}"]`);

	const handleToggle = useCallback(ev => {
		if(isTriggerEvent(ev) || (ev.type === 'keydown' && (['ArrowUp', 'ArrowDown'].includes(ev.key)))) {
			setIsOpen(isColorPickerOpen => !isColorPickerOpen);
			ev.preventDefault();
		} else if(ev.type === 'keydown') {
			onKeyDown?.(ev);
		}
	}, [onKeyDown]);

	const handleClick = useCallback(ev => {
		const color = ev.currentTarget.dataset.color;
		onColorPicked?.(color);
		if(ev.type === 'keydown') {
			ref.current.querySelector('.dropdown-toggle').focus();
		}
		setIsOpen(false);
	}, [onColorPicked]);

	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'ArrowRight') {
			focusNext(ev);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowLeft') {
			focusPrev(ev);
			ev.stopPropagation();
		} else if(ev.key === 'ArrowDown') {
			focusNext(ev, { offset: gridCols });
			ev.stopPropagation();
		} else if(ev.key === 'ArrowUp') {
			focusPrev(ev, { offset: gridCols });
			ev.stopPropagation();
		} else if(ev.key === 'Escape') {
			ref.current.querySelector('.dropdown-toggle').focus();
			setIsOpen(false);
			ev.stopPropagation();
		} else if(ev.key === 'Enter' || ev.key === ' ') {
			handleClick(ev);
			ev.preventDefault();
		}
	}, [focusNext, focusPrev, handleClick]);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			update();
			menuRef.current.focus();
		}
	}, [isOpen, wasOpen, update]);

	return (
		<div ref={ ref } className={ cx('dropdown', { show: isOpen }) }>
			<Button
				onKeyDown={handleToggle }
				onClick={ handleToggle }
				className="color-swatch"
				style={{ backgroundColor: selectedColor } }
				tabIndex={ -1 }
			>
			</Button>
			<Button
				className="btn-icon dropdown-toggle"
				onKeyDown={ handleToggle }
				onClick={ handleToggle }
				tabIndex={ tabIndex }
				ref={ reference }
			>
				<Icon type="16/chevron-9" className="touch" width="16" height="16" />
				<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
			</Button>
			<div ref={ r => { floating(r); menuRef.current = r; } }
				style={{ position: strategy, transform: isOpen ? `translate3d(${x}px, ${y}px, 0px)` : '' }}
				className="dropdown-menu color-picker"
				tabIndex={ -1 }
				onFocus={ receiveFocus }
				onBlur={ receiveBlur }
			>
			{ colors.map((color, index) => (
				<button
					className={cx('color-picker-option', { clear: color === null })}
					data-color={color}
					data-index={index}
					key={color ? color : 'clear'}
					onClick={ handleClick }
					onKeyDown={ handleKeyDown }
					role="menuitem"
					style={{ backgroundColor: color }}
					tabIndex={-2}
					type="button"
				/>
			)) }
		</div>
	</div>
	);
}

ColorPicker.propTypes = {
    colors: PropTypes.array,
    gridCols: PropTypes.number,
    onColorPicked: PropTypes.func,
    onKeyDown: PropTypes.func,
    selectedColor: PropTypes.string,
    tabIndex: PropTypes.number
};

export default memo(ColorPicker);

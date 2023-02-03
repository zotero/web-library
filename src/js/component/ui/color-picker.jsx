import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { memo, useCallback, useId, useRef, useState } from 'react';
import { useFloating, shift } from '@floating-ui/react-dom';

import Button from './button';
import Icon from './icon';
import { useEffect } from 'react';
import { useFocusManager, usePrevious } from '../../hooks';
import { isTriggerEvent } from '../../common/event';
import { pick } from '../../common/immutable';
import colorNames from '../../constants/color-names';

const gridCols = 3;

const ColorPicker = props => {
	const { colors, onKeyDown, onColorPicked, selectedColor, tabIndex = 0, ...rest } = props;
	const [isOpen, setIsOpen] = useState(false);
	const wasOpen = usePrevious(isOpen);
	const ref = useRef(null);
	const menuRef = useRef(null);
	const id = useId();

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
		setIsOpen(false);
		ev.preventDefault();
		ev.stopPropagation();
		if(ev.type === 'keydown') {
			ref.current.focus();
		}
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
			ref.current.focus();
			setIsOpen(false);
			ev.stopPropagation();
		} else if(ev.key === 'Enter' || ev.key === ' ') {
			handleClick(ev);
		}
	}, [focusNext, focusPrev, handleClick]);

	useEffect(() => {
		if(isOpen && !wasOpen) {
			update();
			menuRef.current.focus();
		}
	}, [isOpen, wasOpen, update]);

	return (
		<div
			onKeyDown={handleToggle}
			onClick={handleToggle}
			tabIndex={ tabIndex }
			role="combobox"
			ref={ ref }
			className={ cx('dropdown color-picker', { show: isOpen }) }
			{...pick(rest, p => p.startsWith('data-') || p.startsWith('aria-'))}
			aria-controls={`${id}-menu`}
			aria-expanded={isOpen}
			aria-orientation="horizontal"
		>
			<input type="color" readOnly value={ selectedColor } />
			<Button
				title={ colorNames[selectedColor] || selectedColor }
				tabIndex={ -1 }
				className="color-swatch"
				style={{ backgroundColor: selectedColor } }
			>
			</Button>
			<Button
				tabIndex={ -1 }
				className="btn-icon dropdown-toggle"
				ref={ reference }
			>
				<Icon type="16/chevron-9" className="touch" width="16" height="16" />
				<Icon type="16/chevron-7" className="mouse" width="16" height="16" />
			</Button>
			<div ref={ r => { floating(r); menuRef.current = r; } }
				id={ `${id}-menu` }
				style={{ position: strategy, transform: isOpen ? `translate3d(${x}px, ${y}px, 0px)` : '' }}
				className="dropdown-menu color-picker-grid"
				tabIndex={ -1 }
				onFocus={ receiveFocus }
				onBlur={ receiveBlur }
				role="listbox"
			>
			{ colors.map((color, index) => (
				<button
					aria-selected={ selectedColor === color }
					className={cx('color-picker-option', { clear: color === null })}
					data-color={color}
					data-index={index}
					key={color ? color : 'clear'}
					onClick={ handleClick }
					onKeyDown={ handleKeyDown }
					role="option"
					style={{ backgroundColor: color }}
					tabIndex={-2}
					title={ colorNames[color] || color }
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

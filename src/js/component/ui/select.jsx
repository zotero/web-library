import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { usePrevious } from '../../hooks';
import { scrollIntoViewIfNeeded } from '../../utils';

const Select = forwardRef((props, ref) => {
	const { className, disabled, id, onBlur, onChange, onFocus, options, readOnly,
	required, searchable, simpleValue, tabIndex, value } = props;

	const valueLabel = (options.find(o => o.value === value) || options[0] || {}).label;
	const valueIndex = options.findIndex(o => o.value === value);

	const [isOpen, setIsOpen] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [highlighted, setHighlighted] = useState(valueIndex === -1 ? null : options[valueIndex].value);
	const [keyboard, setKeyboard] = useState(false);

	const wasOpen = usePrevious(isOpen);
	const prevHighlighted = usePrevious(highlighted);

	const selectRef = useRef(null);

	useImperativeHandle(ref, () => ({
		getElement: () => {
			return selectRef.current;
		},
		focus: () => {
			selectRef.current.focus();
			console.log('focus!');
		}
	}));

	// const handleToggle = useCallback(() => {
	// 	console.log('handletoggle');
	// 	setIsOpen(!isOpen);
	// }, [isOpen]);

	const handleFocus = useCallback(() => {
		setIsFocused(true);
	}, []);

	const handleBlur = useCallback(() => {
		setIsOpen(false);
		setIsFocused(false);
	}, []);

	const handleClick = useCallback(() => {
		setIsOpen(true);
		setIsFocused(true);
	}, []);

	const handleItemClick = useCallback(ev => {
		setIsOpen(false);
		setIsFocused(false);
		ev.stopPropagation();
		const newValue = ev.currentTarget.dataset.optionValue;

		if(onChange && newValue !== value) {
			onChange(newValue);
		}
	}, [onChange, value]);

	const getNextIndex = useCallback(direction => {
		const currentIndex = options.findIndex(o => o.value === highlighted);
		if(currentIndex === -1) {
			return 0;
		}
		let nextIndex = currentIndex + direction;
		if(nextIndex > options.length - 1) {
			nextIndex = 0;
		} else if(nextIndex === -1) {
			nextIndex = options.length - 1;
		}
		return nextIndex;
	}, [highlighted, options]);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(!isOpen && (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowDown')) {
			setIsOpen(true);
			ev.preventDefault();
		} else if(isOpen && ev.key === 'Escape') {
			setIsOpen(false);
			ev.stopPropagation();
		} else if(isOpen && ev.key === 'ArrowDown') {
			setKeyboard(true);
			setHighlighted(options[getNextIndex(1)].value);
			ev.preventDefault();
		} else if(isOpen && ev.key === 'ArrowUp') {
			setKeyboard(true);
			setHighlighted(options[getNextIndex(-1)].value);
			ev.preventDefault();
		} else if(isOpen && (ev.key === 'Enter' || ev.key === ' ')) {
			setIsOpen(false);
			setIsFocused(false);
			if(onChange && highlighted && highlighted !== value) {
				onChange(highlighted);
			}
			ev.preventDefault();
		}
	}, [highlighted, isOpen, options, getNextIndex, onChange, value]);

	const handleMouseMove = useCallback(ev => {
		setKeyboard(false);
	}, []);

	useEffect(() => {
		if(!isOpen && wasOpen) {
			setHighlighted(valueIndex === -1 ? null : options[valueIndex].value);
		}
		if(!wasOpen && isOpen && highlighted) {
			const highlightedEl = selectRef.current && selectRef.current.querySelector(`[data-option-value=${highlighted}]`);
			if(highlightedEl) {
				highlightedEl.scrollIntoView(false);
			}
		}
	}, [highlighted, isOpen, wasOpen, options, valueIndex, ref]);

	useEffect(() => {
		if(isOpen && highlighted !== prevHighlighted) {
			const highlightedEl = selectRef.current && selectRef.current.querySelector(`[data-option-value=${highlighted}]`);
			if(highlightedEl) {
				scrollIntoViewIfNeeded(highlightedEl, selectRef.current, false);
			}
		}
	}, [highlighted, prevHighlighted, isOpen]);

	return (
		<div
			className={ cx('select', className, 'single', {
				'is-searchable': searchable, 'is-focused': isFocused, 'has-value': !!value, 'is-keyboard': keyboard, 'is-mouse': !keyboard
			}) }
			onClick={ handleClick }
			onFocus={ handleFocus }
			onBlur={ handleBlur }
			onKeyDown={ handleKeyDown }
			onMouseMove={ handleMouseMove }
			tabIndex={ 0 }
			ref={ selectRef }
		>
			<div className="select-control">
				<div className="select-multi-value-wrapper">
					<div className="select-value">
						<span className="select-value-label" role="option">
							{ valueLabel }
						</span>
					</div>
					<div className="select-input">
						<input tabIndex={ -2 } />
					</div>
				</div>
				<div className="select-arrow-container">
					<span className="select-arrow" />
				</div>
			</div>
			{ (isFocused && isOpen) && (
				<div className="select-menu-outer">
					<div className="select-menu" role="list">
						{ options.map(option =>
							<div
								className={ cx("select-option", {
									'is-focused': highlighted === option.value,
									'is-selected': value === option.value
								}) }
								key={ option.value }
								onClick={ handleItemClick }
								data-option-value={ option.value }
								role="option"
								aria-selected={ value === option.value }
							>
								{ option.label }
							</div>
						)}
					</div>
				</div>
			) }
		</div>
	);
});

Select.displayName = 'Select';

export default memo(Select);

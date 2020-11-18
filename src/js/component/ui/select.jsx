import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { flattenChildren, mapChildren } from '../../common/react';
import { pick } from '../../common/immutable';
import { scrollIntoViewIfNeeded } from '../../utils';
import { usePrevious } from '../../hooks';

const SelectOption = memo(({ option, value, highlighted, onMouseDown }) => {
	return (
		<div
			className={ cx('select-option', {
				'is-focused': highlighted === option.value,
				'is-selected': value === option.value
			}) }
			key={ option.value }
			onMouseDown={ onMouseDown }
			data-option-value={ option.value }
			role="option"
			aria-selected={ value === option.value }
		>
			{ option.label }
		</div>
	)
});

SelectOption.displayName = 'SelectOption';

SelectOption.propTypes = {
	highlighted: PropTypes.string,
	onMouseDown: PropTypes.func,
	option: PropTypes.object,
	value: PropTypes.string,
};

const SelectDivider = memo(() => <div className="select-option select-divider" />);

SelectDivider.displayName = 'SelectDivider';

const Select = forwardRef((props, ref) => {
	const { children, className, disabled, id, onBlur, onChange, onFocus, options, readOnly, searchable,
	tabIndex = 0, value, ...rest } = props;

	const valueLabel = (options.find(o => o.value === value) || options[0] || {}).label;
	const valueIndex = options.findIndex(o => o.value === value);

	const [isOpen, setIsOpen] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [highlighted, setHighlighted] = useState(valueIndex === -1 ? null : options[valueIndex].value);
	const [keyboard, setKeyboard] = useState(false);
	const [filter, setFilter] = useState('');
	const [filteredOptions, setFilteredOptions] = useState(options);

	const wasOpen = usePrevious(isOpen);
	const prevHighlighted = usePrevious(highlighted);

	const selectRef = useRef(null);
	const inputRef = useRef(null);
	const selectMenuRef = useRef(null);

	const mergedOptions = useMemo(() => {
		const childrenOptions = flattenChildren(children)
			.filter(c => c.type === SelectOption)
			.map(c => ({ ...c.props.option, component: c }));
		return [...filteredOptions, ...childrenOptions];
	}, [children, filteredOptions]);

	useImperativeHandle(ref, () => ({
		getElement: () => {
			return selectRef.current;
		},
		focus: () => {
			selectRef.current.focus();
		}
	}));

	const handleFocus = useCallback(ev => {
		if(!disabled && !readOnly) {
			setIsFocused(true);
			if(searchable) {
				selectRef.current.tabIndex = -2;
				inputRef.current.focus();
			}
		}

		if(onFocus) {
			onFocus(ev);
		}
	}, [disabled, inputRef, searchable, onFocus, readOnly]);

	const handleBlur = useCallback(ev => {
		selectRef.current.tabIndex = tabIndex;
		if(onBlur) {
			onBlur(ev)
		}

		setIsOpen(false);
		setIsFocused(false);
	}, [onBlur, tabIndex]);

	const handleClick = useCallback(ev => {
		if(ev.target.closest('.select-option')) {
			return;
		}
		if(!disabled && !readOnly) {
			setIsOpen(true);
			setIsFocused(true);
			setFilter('');
			setFilteredOptions(options);
			setHighlighted(valueIndex === -1 ? null : options[valueIndex].value);
		}
	}, [disabled, options, valueIndex, readOnly]);


	// using mouse down to prevent blur firing first
	const handleItemMouseDown = useCallback(ev => {
		setIsOpen(false);
		setIsFocused(false);
		ev.stopPropagation();
		const newValue = ev.currentTarget.dataset.optionValue;
		const targetOption = mergedOptions.find(mo => mo.value === newValue);
		if(targetOption && targetOption.component && targetOption.component.props.onTrigger) {
			targetOption.component.props.onTrigger(ev);
		} else if(!targetOption.component && onChange && newValue !== value) {
			onChange(newValue);
		}
	}, [mergedOptions, onChange, value]);

	const getNextIndex = useCallback(direction => {
		const currentIndex = mergedOptions.findIndex(o => o.value === highlighted);
		if(currentIndex === -1) {
			return 0;
		}
		let nextIndex = currentIndex + direction;
		if(nextIndex > mergedOptions.length - 1) {
			nextIndex = 0;
		} else if(nextIndex === -1) {
			nextIndex = mergedOptions.length - 1;
		}
		return nextIndex;
	}, [mergedOptions, highlighted]);

	const handleKeyDown = useCallback(ev => {
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(disabled || readOnly) {
			return;
		}

		if(!isOpen && (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowDown')) {
			setIsOpen(true);
			setFilter('');
			setFilteredOptions(options);
			setHighlighted(valueIndex === -1 ? null : options[valueIndex].value);
			ev.preventDefault();
		} else if(isOpen && ev.key === 'Escape') {
			setIsOpen(false);
			ev.stopPropagation();
		} else if(isOpen && ev.key === 'ArrowDown') {
			setKeyboard(true);
			setHighlighted(mergedOptions[getNextIndex(1)].value);
			ev.preventDefault();
		} else if(isOpen && ev.key === 'ArrowUp') {
			setKeyboard(true);
			setHighlighted(mergedOptions[getNextIndex(-1)].value);
			ev.preventDefault();
		} else if(isOpen && (ev.key === 'Enter' || ev.key === ' ')) {
			setIsOpen(false);
			setIsFocused(false);
			setFilter('');
			setFilteredOptions(options);

			const targetOption = mergedOptions.find(mo => mo.value === highlighted);
			if(targetOption && targetOption.component && targetOption.component.props.onTrigger) {
				targetOption.component.props.onTrigger(ev);
			} else if(!targetOption.component && onChange && highlighted && highlighted !== value) {
				onChange(highlighted);
			}
			ev.preventDefault();
		}
	}, [disabled, highlighted, isOpen, mergedOptions, getNextIndex, onChange, value, valueIndex, options, readOnly]);

	const handleMouseMove = useCallback(() => {
		setKeyboard(false);
	}, []);

	const handleSearchInput = useCallback(ev => {
		const newFilter = ev.currentTarget.value;
		if(newFilter !== filter) {
			const newOptions = options.filter(o => o.label.toLowerCase().includes(newFilter.toLowerCase()));
			setFilter(newFilter);
			setFilteredOptions(newOptions);
			if(newOptions.length && !newOptions.some(o => o.value === highlighted)) {
				setHighlighted(newOptions[0].value);
			}
		}
		if(!isOpen) {
			setIsOpen(true);
			setFilteredOptions(options);
			setHighlighted(valueIndex === -1 ? null : options[valueIndex].value);
		}
	}, [filter, isOpen, options, highlighted, valueIndex]);

	useEffect(() => {
		if(!isOpen && wasOpen) {
			setFilter('');
			setFilteredOptions(options);
			setHighlighted(null);
			if(document.activeElement === inputRef.current) {
				inputRef.current.blur();
			}
		}
		if(!wasOpen && isOpen) {
			const highlightedEl = selectRef.current && selectRef.current.querySelector(`[data-option-value=${highlighted}]`);
			if(highlightedEl) {
				scrollIntoViewIfNeeded(highlightedEl, selectMenuRef.current, false);
			}
		}
	}, [highlighted, isOpen, wasOpen, options, valueIndex, ref]);

	useEffect(() => {
		if(isOpen && highlighted !== prevHighlighted) {
			const highlightedEl = selectRef.current && selectRef.current.querySelector(`[data-option-value=${highlighted}]`);
			if(highlightedEl) {
				scrollIntoViewIfNeeded(highlightedEl, selectMenuRef.current, false);
			}
		}
	}, [highlighted, prevHighlighted, isOpen]);

	return (
		<div
			className={ cx('select-component', className, 'single', {
				'is-searchable': searchable, 'is-focused': isFocused, 'has-value': !!value,
				'is-keyboard': keyboard, 'is-mouse': !keyboard, 'is-disabled': disabled, 'is-readonly': readOnly
			}) }
			id={ id }
			onBlur={ handleBlur }
			onClick={ handleClick }
			onFocus={ handleFocus }
			onKeyDown={ searchable ? null : handleKeyDown }
			onMouseMove={ handleMouseMove }
			ref={ selectRef }
			tabIndex={ disabled ? null : tabIndex }
			aria-disabled={ disabled }
			aria-readonly={ readOnly }
			{ ... pick(rest, p => p.startsWith('data-')) }
		>
			<div className="select-control">
				<div className="select-multi-value-wrapper">
					<div className="select-value">
					{ (!searchable || !filter.length) && (
						<span className="select-value-label" role="option">
							{ valueLabel }
						</span>
					) }
					</div>
					<div className="select-input">
						<input
							disabled={ !searchable }
							onChange={ handleSearchInput }
							onKeyDown={ searchable ? handleKeyDown : null }
							ref={ inputRef }
							tabIndex={ -2 }
							value={ filter }
						/>
					</div>
				</div>
				<div className="select-arrow-container">
					<span className="select-arrow" />
				</div>
			</div>
			{ (isFocused && isOpen) && (
				<div className="select-menu-outer">
					<div className="select-menu" role="list" ref={ selectMenuRef }>
						{ filteredOptions.map(option =>
							<SelectOption
								key={ option.value }
								highlighted={ highlighted }
								onMouseDown={ handleItemMouseDown }
								option={ option }
								value={ value }
							/>
						) }
						{ filteredOptions.length === 0 && (
							<div className="select-noresults">
								No results found
							</div>
						) }
						{ mapChildren(children, child =>
							child && child.type === SelectOption ?
								React.cloneElement(child, { highlighted, value, onMouseDown: handleItemMouseDown }) :
								child
						) }
					</div>
				</div>
			) }
		</div>
	);
});

Select.displayName = 'Select';

Select.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	id: PropTypes.string,
	onBlur: PropTypes.func,
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	options: PropTypes.array,
	readOnly: PropTypes.bool,
	required: PropTypes.bool,
	searchable: PropTypes.bool,
	tabIndex: PropTypes.number,
	value: PropTypes.string,
};

export { SelectDivider, SelectOption };
export default memo(Select);

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Select, Spinner } from 'web-common/components';
import { usePrevious } from 'web-common/hooks';
import { pick } from 'web-common/utils';

const SelectInput = forwardRef((props, ref) => {
	const { autoFocus, className, clearable, isDisabled, isReadOnly, isRequired, id, placeholder, tabIndex,
		inputGroupClassName, isBusy, value: initialValue = null, options, onBlur, onCancel, onCommit, onChange,
		onFocus, ...rest } = props;
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const [value, setValue]  = useState(initialValue);
	const prevInitialValue = usePrevious(initialValue);
	const input = useRef(null);

	const groupClassName = cx({
		'busy': isBusy,
		'input-group': true,
		'select': true,
		[inputGroupClassName]: !!inputGroupClassName
	});

	useImperativeHandle(ref, () => ({
		focus: () => {
			input.current.focus();
		}
	}));

	const handleBlur = useCallback(ev => {
		if(onBlur) {
			onBlur(ev);
		}
		if(onCancel) {
			onCancel(value !== initialValue, ev);
		}
	}, [initialValue, onCancel, onBlur, value]);

	// const handleFocus = useCallback(() => {}, []);
	const handleKeyDown = useCallback(ev => {
		if(ev.key === 'Escape' && onCancel) {
			onCancel();
		}
	}, [onCancel]);

	const handleChange = useCallback((newValue, ev) => {
		newValue = newValue !== null || (newValue === null && clearable) ?
			newValue : initialValue;

		setValue(newValue);

		if(onChange(newValue)) {
			if(!ev) {
				const source = input.current && typeof input.current.getElement === 'function' ?
					input.current.getElement() : input.current.input;
				ev = {
					type: 'change',
					currentTarget: source,
					target: source
				}
			}
			onCommit(newValue, newValue !== initialValue, ev);
		}
	}, [clearable, initialValue, onChange, onCommit]);

	const handleNativeChange = useCallback(ev => handleChange(ev.target.value, ev), [handleChange]);

	const commonProps = { disabled: isDisabled, onBlur: handleBlur, onFocus, readOnly:
	isReadOnly, ref, required: isRequired, id, value, tabIndex };

	useEffect(() => {
		if(initialValue !== prevInitialValue && initialValue !== value) {
			setValue(initialValue);
		}
	}, [initialValue, value, prevInitialValue]);

	return (
		<div className={ groupClassName }>
			{ isTouchOrSmall ? (
				<div className="native-select-wrap" >
					<select
						{ ...commonProps }
						{ ...({ autoFocus, placeholder })}
						onKeyDown={ handleKeyDown }
						onChange={ handleNativeChange }
						ref={ input }
						{ ... pick(rest, p => p.startsWith('data-') || p.startsWith('aria-')) }
					>
						{ options.map(({ value, label }) => (
							<option key={ value } value={ value }>{ label }</option>)
						)}
					</select>
					<div className={ className }>
						{ (options.find(o => o.value === value) || (value !== null ? { label: value } : false) || options[0] || {}).label }
					</div>
				</div>
			) : (
				<Select
					{ ...props }
					{ ...commonProps }
					onInputKeyDown={ handleKeyDown }
					onChange={ handleChange }
					ref={ input }
				/>
			) }
			{ isBusy ? <Spinner className="small" /> : null }
		</div>
	);
});

SelectInput.displayName = 'SelectInput';

SelectInput.propTypes = {
	autoFocus: PropTypes.bool,
	className: PropTypes.string,
	clearable: PropTypes.bool,
	id: PropTypes.string,
	inputGroupClassName: PropTypes.string,
	isBusy: PropTypes.bool,
	isDisabled: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isRequired: PropTypes.bool,
	onBlur: PropTypes.func,
	onCancel: PropTypes.func,
	onChange: PropTypes.func.isRequired,
	onCommit: PropTypes.func.isRequired,
	onFocus: PropTypes.func,
	options: PropTypes.array.isRequired,
	placeholder: PropTypes.string,
	searchable: PropTypes.bool,
	tabIndex: PropTypes.number,
	value: PropTypes.string.isRequired,
};

export default memo(SelectInput);

import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePrevious } from 'web-common/hooks';
import { noop, pick } from 'web-common/utils';
import { Spinner } from 'web-common/components';

import AutoResizer from './auto-resizer';

const NATIVE_INPUT_PROPS = ['autoComplete', 'autoFocus', 'cols', 'disabled', 'form', 'id',
'maxLength', 'minLength', 'name', 'placeholder', 'readOnly', 'required', 'rows', 'spellCheck',
'tabIndex', 'wrap'];

const TextAreaInput = memo(forwardRef((props, ref) => {
	const { className, inputGroupClassName, isBusy, value: initialValue, isSingleLine, onBlur = noop,
		onFocus = noop, onCancel = noop, onChange = noop, onCommit = noop, onKeyDown = noop,
		onKeyUp = noop, selectOnFocus, resize, ...rest } = props;
	const [value, setValue] = useState(initialValue);
	const prevInitialValue = usePrevious(initialValue);

	const input = useRef(null);
	const hasBeenCancelled = useRef(false);
	const hasBeenCommitted = useRef(false);

	const groupClassName = cx({
		'input-group': true,
		'textarea': true,
		'busy': isBusy
	}, inputGroupClassName);

	//reset on every render
	hasBeenCancelled.current = false;
	hasBeenCommitted.current = false;

	useImperativeHandle(ref, () => ({
		focus: () => {
			input.current.focus();
			if(selectOnFocus) {
				input.current.select();
			}
		}
	}));

	const handleChange = useCallback(ev => {
		setValue(ev.currentTarget.value);
		onChange(ev.currentTarget.value);
	}, [onChange]);

	const handleBlur = useCallback(ev => {
		const shouldCancel = onBlur(ev);
		if (hasBeenCancelled.current || hasBeenCommitted.current) {
			return;
		}
		if(shouldCancel) {
			onCancel(value !== initialValue, ev);
			hasBeenCancelled.current = true;
		} else {
			onCommit(value, value !== initialValue, ev);
			hasBeenCommitted.current = true;
		}
	}, [onBlur, initialValue, onCancel, onCommit, value]);

	const handleFocus = useCallback(ev => {
		if(selectOnFocus) {
			ev.currentTarget.select();
		} else {
			onFocus(ev);
		}
	}, [onFocus, selectOnFocus]);

	const handleKeyDown = useCallback(ev => {
		switch (event.key) {
			case 'Escape':
				onCancel(value !== initialValue, ev);
				hasBeenCancelled.current = true;
			break;
			case 'Enter':
				if(event.shiftKey || isSingleLine) {
					onCommit(value, value !== initialValue, ev);
					hasBeenCommitted.current = true;
				}
			break;
		default:
			onKeyDown(ev);
			return;
		}
	}, [initialValue, isSingleLine, onCancel, onCommit, onKeyDown, value]);

	useEffect(() => {
		if(initialValue !== prevInitialValue && initialValue !== value) {
			setValue(initialValue);
		}
	}, [initialValue, value, prevInitialValue]);

	const textarea = (
		<textarea
			className={ className }
			onBlur={ handleBlur }
			onChange={ handleChange }
			onFocus={ handleFocus }
			onKeyUp={ onKeyUp }
			onKeyDown={ handleKeyDown }
			ref={ input }
			value={ value }
			{ ...pick(rest, NATIVE_INPUT_PROPS) }
			{ ...pick(rest, key => key.match(/^(aria-|data-).*/)) }
		/>
	);

	return (
		<div className={ groupClassName }>
			{ resize ? (
				<AutoResizer
					content={ value }
					vertical={ resize === 'vertical' }
				>
					{ textarea }
				</AutoResizer>
			) : textarea }
			{ isBusy && <Spinner /> }
		</div>
	);
}));

TextAreaInput.displayName = 'TextAreaInput';
TextAreaInput.propTypes = {
		className: PropTypes.string,
		form: PropTypes.string,
		inputGroupClassName: PropTypes.string,
		isBusy: PropTypes.bool,
		isDisabled: PropTypes.bool,
		isReadOnly: PropTypes.bool,
		isRequired: PropTypes.bool,
		isSingleLine: PropTypes.bool,
		onBlur: PropTypes.func,
		onCancel: PropTypes.func,
		onChange: PropTypes.func,
		onCommit: PropTypes.func,
		onFocus: PropTypes.func,
		onKeyDown: PropTypes.func,
		onKeyUp: PropTypes.func,
		resize: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
		selectOnFocus: PropTypes.bool,
		value: PropTypes.string,
}

export default TextAreaInput;
